using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AccountingService.Data;
using AccountingService.Models;
using AccountingService.Services;

namespace AccountingService.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportsController(AccountingContext db, AccountingBusinessService svc) : ControllerBase
{
    // GET /api/reports/trial-balance?branch=main&from=2024-01-01&to=2024-12-31
    [HttpGet("trial-balance")]
    public async Task<IActionResult> TrialBalance(
        [FromQuery] string branch = "main",
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var lines = await svc.GetTrialBalanceAsync(branch, from, to);
        var totalDebit  = lines.Sum(l => l.Debit);
        var totalCredit = lines.Sum(l => l.Credit);
        return Ok(new {
            success = true, lines,
            totalDebit, totalCredit,
            isBalanced = totalDebit == totalCredit
        });
    }

    // GET /api/reports/income-statement?branch=main&from=2024-01-01&to=2024-12-31
    [HttpGet("income-statement")]
    public async Task<IActionResult> IncomeStatement(
        [FromQuery] string branch = "main",
        [FromQuery] DateTime from = default,
        [FromQuery] DateTime to = default)
    {
        if (from == default) from = new DateTime(DateTime.UtcNow.Year, 1, 1);
        if (to == default)   to   = DateTime.UtcNow;
        var stmt = await svc.GetIncomeStatementAsync(branch, from, to);
        return Ok(new { success = true, statement = stmt });
    }

    // GET /api/reports/balance-sheet?branch=main&asOf=2024-12-31
    [HttpGet("balance-sheet")]
    public async Task<IActionResult> BalanceSheet(
        [FromQuery] string branch = "main",
        [FromQuery] DateTime? asOf = null)
    {
        var sheet = await svc.GetBalanceSheetAsync(branch, asOf ?? DateTime.UtcNow);
        return Ok(new { success = true, sheet });
    }

    // GET /api/reports/account-ledger/{accountId}?from=...&to=...
    [HttpGet("account-ledger/{accountId}")]
    public async Task<IActionResult> AccountLedger(
        int accountId,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var account = await db.Accounts.FindAsync(accountId);
        if (account is null) return NotFound(new { success = false });

        var query = db.JournalLines
            .Include(l => l.JournalEntry)
            .Where(l => l.AccountId == accountId && l.JournalEntry.Status == EntryStatus.Posted)
            .AsQueryable();

        if (from.HasValue) query = query.Where(l => l.JournalEntry.Date >= from.Value);
        if (to.HasValue)   query = query.Where(l => l.JournalEntry.Date <= to.Value);

        var lines = await query
            .OrderBy(l => l.JournalEntry.Date).ThenBy(l => l.JournalEntry.Id)
            .Select(l => new {
                date        = l.JournalEntry.Date,
                entryNumber = l.JournalEntry.EntryNumber,
                description = l.Description ?? l.JournalEntry.Description,
                l.Debit, l.Credit
            })
            .ToListAsync();

        // Running balance
        decimal balance = 0;
        var ledger = lines.Select(l => {
            balance += account.Type is AccountType.Asset or AccountType.Expense
                ? l.Debit - l.Credit
                : l.Credit - l.Debit;
            return new { l.date, l.entryNumber, l.description, l.Debit, l.Credit, balance };
        }).ToList();

        return Ok(new {
            success = true, account = new { account.Code, account.Name, account.TypeAr },
            lines = ledger,
            totalDebit  = lines.Sum(l => l.Debit),
            totalCredit = lines.Sum(l => l.Credit),
            closingBalance = balance
        });
    }

    // GET /api/reports/dashboard?branch=main
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard([FromQuery] string branch = "main")
    {
        var now   = DateTime.UtcNow;
        var start = new DateTime(now.Year, now.Month, 1);

        var totalEntries  = await db.JournalEntries.CountAsync(j => j.Branch == branch);
        var postedEntries = await db.JournalEntries.CountAsync(j => j.Branch == branch && j.Status == EntryStatus.Posted);
        var draftEntries  = await db.JournalEntries.CountAsync(j => j.Branch == branch && j.Status == EntryStatus.Draft);

        var monthlyRevenue = await db.JournalLines
            .Include(l => l.JournalEntry).Include(l => l.Account)
            .Where(l => l.JournalEntry.Branch == branch
                && l.JournalEntry.Status == EntryStatus.Posted
                && l.JournalEntry.Date >= start
                && l.Account.Type == AccountType.Revenue)
            .SumAsync(l => l.Credit - l.Debit);

        var monthlyExpense = await db.JournalLines
            .Include(l => l.JournalEntry).Include(l => l.Account)
            .Where(l => l.JournalEntry.Branch == branch
                && l.JournalEntry.Status == EntryStatus.Posted
                && l.JournalEntry.Date >= start
                && l.Account.Type == AccountType.Expense)
            .SumAsync(l => l.Debit - l.Credit);

        return Ok(new {
            success = true,
            stats = new {
                totalEntries, postedEntries, draftEntries,
                monthlyRevenue, monthlyExpense,
                monthlyNetIncome = monthlyRevenue - monthlyExpense
            }
        });
    }
}
