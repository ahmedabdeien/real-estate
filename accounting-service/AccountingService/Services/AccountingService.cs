using Microsoft.EntityFrameworkCore;
using AccountingService.Data;
using AccountingService.Models;

namespace AccountingService.Services;

public class AccountingBusinessService(AccountingContext db)
{
    // ─── Journal Entry Number Generator ──────────────────────────────────────
    public async Task<string> GenerateEntryNumberAsync(string branch)
    {
        var year = DateTime.UtcNow.Year;
        var count = await db.JournalEntries
            .CountAsync(j => j.Branch == branch && j.CreatedAt.Year == year);
        return $"JE-{year}-{(count + 1):D4}";
    }

    // ─── Post Entry (validates balance) ──────────────────────────────────────
    public async Task<(bool success, string error)> PostEntryAsync(int entryId)
    {
        var entry = await db.JournalEntries
            .Include(j => j.Lines)
            .FirstOrDefaultAsync(j => j.Id == entryId);

        if (entry is null) return (false, "القيد غير موجود");
        if (entry.Status == EntryStatus.Posted) return (false, "القيد مرحّل بالفعل");

        var debit  = entry.Lines.Sum(l => l.Debit);
        var credit = entry.Lines.Sum(l => l.Credit);
        if (debit != credit)
            return (false, $"القيد غير متوازن: مدين {debit:N2} ≠ دائن {credit:N2}");

        entry.Status   = EntryStatus.Posted;
        entry.PostedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return (true, "");
    }

    // ─── Reverse Entry ────────────────────────────────────────────────────────
    public async Task<(bool success, string error, JournalEntry? reversed)> ReverseEntryAsync(int entryId, string createdBy)
    {
        var entry = await db.JournalEntries
            .Include(j => j.Lines).ThenInclude(l => l.Account)
            .FirstOrDefaultAsync(j => j.Id == entryId);

        if (entry is null) return (false, "القيد غير موجود", null);
        if (entry.Status != EntryStatus.Posted) return (false, "يمكن عكس القيود المرحّلة فقط", null);

        var newEntry = new JournalEntry
        {
            EntryNumber    = await GenerateEntryNumberAsync(entry.Branch),
            Date           = DateTime.UtcNow,
            Description    = $"عكس قيد: {entry.EntryNumber} - {entry.Description}",
            Branch         = entry.Branch,
            Status         = EntryStatus.Posted,
            PostedAt       = DateTime.UtcNow,
            CreatedBy      = createdBy,
            ReversedFromId = entryId,
            Lines          = entry.Lines.Select((l, i) => new JournalEntryLine {
                AccountId   = l.AccountId,
                Debit       = l.Credit,   // Swap debit/credit
                Credit      = l.Debit,
                Description = l.Description,
                Order       = i
            }).ToList()
        };

        db.JournalEntries.Add(newEntry);
        entry.Status = EntryStatus.Reversed;
        await db.SaveChangesAsync();
        return (true, "", newEntry);
    }

    // ─── Account Balance ──────────────────────────────────────────────────────
    public async Task<decimal> GetAccountBalanceAsync(int accountId, DateTime? from = null, DateTime? to = null)
    {
        var query = db.JournalLines
            .Include(l => l.JournalEntry)
            .Where(l => l.AccountId == accountId && l.JournalEntry.Status == EntryStatus.Posted);

        if (from.HasValue) query = query.Where(l => l.JournalEntry.Date >= from.Value);
        if (to.HasValue)   query = query.Where(l => l.JournalEntry.Date <= to.Value);

        var account = await db.Accounts.FindAsync(accountId);
        if (account is null) return 0;

        var lines = await query.ToListAsync();
        var debit  = lines.Sum(l => l.Debit);
        var credit = lines.Sum(l => l.Credit);

        // Normal balance: Asset+Expense = Debit; Liability+Equity+Revenue = Credit
        return account.Type is AccountType.Asset or AccountType.Expense
            ? debit - credit
            : credit - debit;
    }

    // ─── Trial Balance ────────────────────────────────────────────────────────
    public async Task<List<TrialBalanceLine>> GetTrialBalanceAsync(string branch, DateTime? from, DateTime? to)
    {
        var accounts = await db.Accounts
            .Where(a => a.Branch == branch && a.IsActive)
            .OrderBy(a => a.Code)
            .ToListAsync();

        var lines = await db.JournalLines
            .Include(l => l.JournalEntry)
            .Where(l => l.JournalEntry.Branch == branch && l.JournalEntry.Status == EntryStatus.Posted)
            .Where(l => !from.HasValue || l.JournalEntry.Date >= from.Value)
            .Where(l => !to.HasValue   || l.JournalEntry.Date <= to.Value)
            .GroupBy(l => l.AccountId)
            .Select(g => new { AccountId = g.Key, Debit = g.Sum(x => x.Debit), Credit = g.Sum(x => x.Credit) })
            .ToListAsync();

        return accounts
            .Select(a => {
                var entry = lines.FirstOrDefault(l => l.AccountId == a.Id);
                var d = entry?.Debit  ?? 0;
                var c = entry?.Credit ?? 0;
                var balance = a.Type is AccountType.Asset or AccountType.Expense ? d - c : c - d;
                return new TrialBalanceLine(a.Code, a.Name, a.TypeAr, d, c, balance);
            })
            .Where(l => l.Debit != 0 || l.Credit != 0)
            .ToList();
    }

    // ─── Income Statement ─────────────────────────────────────────────────────
    public async Task<IncomeStatement> GetIncomeStatementAsync(string branch, DateTime from, DateTime to)
    {
        var revenues  = await GetTypeBalanceAsync(branch, AccountType.Revenue,  from, to);
        var expenses  = await GetTypeBalanceAsync(branch, AccountType.Expense,  from, to);
        var netIncome = revenues.Sum(r => r.Balance) - expenses.Sum(e => e.Balance);
        return new IncomeStatement(revenues, expenses, netIncome, from, to);
    }

    private async Task<List<AccountBalance>> GetTypeBalanceAsync(string branch, AccountType type, DateTime? from, DateTime? to)
    {
        var accounts = await db.Accounts.Where(a => a.Branch == branch && a.Type == type && a.IsActive).ToListAsync();
        var result = new List<AccountBalance>();
        foreach (var a in accounts)
        {
            var bal = await GetAccountBalanceAsync(a.Id, from, to);
            if (bal != 0) result.Add(new AccountBalance(a.Code, a.Name, bal));
        }
        return result;
    }

    // ─── Balance Sheet ────────────────────────────────────────────────────────
    public async Task<BalanceSheet> GetBalanceSheetAsync(string branch, DateTime asOf)
    {
        DateTime? noFrom = null;
        DateTime? toDate = asOf;
        var assets      = await GetTypeBalanceAsync(branch, AccountType.Asset,     noFrom, toDate);
        var liabilities = await GetTypeBalanceAsync(branch, AccountType.Liability, noFrom, toDate);
        var equity      = await GetTypeBalanceAsync(branch, AccountType.Equity,    noFrom, toDate);
        return new BalanceSheet(assets, liabilities, equity, asOf);
    }
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
public record TrialBalanceLine(string Code, string Name, string Type, decimal Debit, decimal Credit, decimal Balance);
public record AccountBalance(string Code, string Name, decimal Balance);
public record IncomeStatement(List<AccountBalance> Revenues, List<AccountBalance> Expenses, decimal NetIncome, DateTime From, DateTime To);
public record BalanceSheet(List<AccountBalance> Assets, List<AccountBalance> Liabilities, List<AccountBalance> Equity, DateTime AsOf);
