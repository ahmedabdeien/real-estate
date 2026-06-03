using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AccountingService.Data;
using AccountingService.Models;
using AccountingService.Services;

namespace AccountingService.Controllers;

[ApiController]
[Route("api/journal")]
public class JournalController(AccountingContext db, AccountingBusinessService svc) : ControllerBase
{
    // GET /api/journal?branch=main&page=1&limit=20&from=2024-01-01&to=2024-12-31
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string branch = "main",
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] string? status = null)
    {
        var query = db.JournalEntries
            .Include(j => j.Lines).ThenInclude(l => l.Account)
            .Where(j => j.Branch == branch)
            .AsQueryable();

        if (from.HasValue) query = query.Where(j => j.Date >= from.Value);
        if (to.HasValue)   query = query.Where(j => j.Date <= to.Value);
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<EntryStatus>(status, true, out var s))
            query = query.Where(j => j.Status == s);

        var total = await query.CountAsync();
        var entries = await query
            .OrderByDescending(j => j.Date).ThenByDescending(j => j.Id)
            .Skip((page - 1) * limit).Take(limit)
            .Select(j => new {
                j.Id, j.EntryNumber, j.Date, j.Description, j.Reference,
                j.Branch, status = j.Status.ToString(), j.CreatedBy, j.CreatedAt, j.PostedAt,
                totalDebit  = j.Lines.Sum(l => l.Debit),
                totalCredit = j.Lines.Sum(l => l.Credit),
                isBalanced  = j.Lines.Sum(l => l.Debit) == j.Lines.Sum(l => l.Credit),
                lines = j.Lines.OrderBy(l => l.Order).Select(l => new {
                    l.Id, l.AccountId, accountCode = l.Account.Code,
                    accountName = l.Account.Name, l.Debit, l.Credit, l.Description
                })
            })
            .ToListAsync();

        return Ok(new { success = true, entries, total, page, limit });
    }

    // GET /api/journal/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOne(int id)
    {
        var entry = await db.JournalEntries
            .Include(j => j.Lines).ThenInclude(l => l.Account)
            .FirstOrDefaultAsync(j => j.Id == id);
        if (entry is null) return NotFound(new { success = false });
        return Ok(new { success = true, entry });
    }

    // POST /api/journal — create draft
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJournalEntryDto dto)
    {
        if (dto.Lines is null || dto.Lines.Count < 2)
            return BadRequest(new { success = false, message = "القيد يحتاج سطرين على الأقل" });

        var debit  = dto.Lines.Sum(l => l.Debit);
        var credit = dto.Lines.Sum(l => l.Credit);
        if (debit != credit)
            return BadRequest(new { success = false, message = $"القيد غير متوازن: مدين {debit:N2} ≠ دائن {credit:N2}" });

        // Validate all accounts exist
        var accountIds = dto.Lines.Select(l => l.AccountId).Distinct().ToList();
        var existingIds = await db.Accounts.Where(a => accountIds.Contains(a.Id)).Select(a => a.Id).ToListAsync();
        var missing = accountIds.Except(existingIds).ToList();
        if (missing.Count > 0)
            return BadRequest(new { success = false, message = $"حسابات غير موجودة: {string.Join(", ", missing)}" });

        var entry = new JournalEntry {
            EntryNumber = await svc.GenerateEntryNumberAsync(dto.Branch),
            Date        = dto.Date,
            Description = dto.Description,
            Reference   = dto.Reference,
            Branch      = dto.Branch,
            Status      = dto.PostImmediately ? EntryStatus.Posted : EntryStatus.Draft,
            PostedAt    = dto.PostImmediately ? DateTime.UtcNow : null,
            CreatedBy   = dto.CreatedBy,
            Lines       = dto.Lines.Select((l, i) => new JournalEntryLine {
                AccountId   = l.AccountId,
                Debit       = l.Debit,
                Credit      = l.Credit,
                Description = l.Description,
                Order       = i
            }).ToList()
        };

        db.JournalEntries.Add(entry);
        await db.SaveChangesAsync();
        return Created("", new { success = true, entry = new { entry.Id, entry.EntryNumber, entry.Status } });
    }

    // PUT /api/journal/{id}/post
    [HttpPut("{id}/post")]
    public async Task<IActionResult> Post(int id)
    {
        var (success, error) = await svc.PostEntryAsync(id);
        if (!success) return BadRequest(new { success = false, message = error });
        return Ok(new { success = true, message = "تم ترحيل القيد" });
    }

    // PUT /api/journal/{id}/reverse
    [HttpPut("{id}/reverse")]
    public async Task<IActionResult> Reverse(int id, [FromQuery] string createdBy = "system")
    {
        var (success, error, reversed) = await svc.ReverseEntryAsync(id, createdBy);
        if (!success) return BadRequest(new { success = false, message = error });
        return Ok(new { success = true, reversedEntry = new { reversed!.Id, reversed.EntryNumber } });
    }

    // DELETE /api/journal/{id} — only drafts
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entry = await db.JournalEntries.FindAsync(id);
        if (entry is null) return NotFound();
        if (entry.Status != EntryStatus.Draft)
            return BadRequest(new { success = false, message = "يمكن حذف القيود المسودة فقط" });
        db.JournalEntries.Remove(entry);
        await db.SaveChangesAsync();
        return Ok(new { success = true });
    }
}

public record CreateJournalEntryDto(
    DateTime Date, string Description, string Branch = "main",
    string? Reference = null, string CreatedBy = "system",
    bool PostImmediately = false,
    List<JournalLineDto>? Lines = null
);
public record JournalLineDto(int AccountId, decimal Debit, decimal Credit, string? Description = null);
