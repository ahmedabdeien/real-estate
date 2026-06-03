using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AccountingService.Data;
using AccountingService.Models;

namespace AccountingService.Controllers;

[ApiController]
[Route("api/accounts")]
public class AccountsController(AccountingContext db) : ControllerBase
{
    // GET /api/accounts?branch=main
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string branch = "main")
    {
        var accounts = await db.Accounts
            .Where(a => a.Branch == branch)
            .OrderBy(a => a.Code)
            .Select(a => new {
                a.Id, a.Code, a.Name, a.TypeAr, type = a.Type.ToString(),
                a.ParentCode, a.IsActive, a.Description
            })
            .ToListAsync();
        return Ok(new { success = true, accounts });
    }

    // POST /api/accounts
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAccountDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code) || string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { success = false, message = "الكود والاسم مطلوبان" });

        var exists = await db.Accounts.AnyAsync(a => a.Code == dto.Code && a.Branch == dto.Branch);
        if (exists) return Conflict(new { success = false, message = "كود الحساب موجود مسبقاً" });

        if (!Enum.TryParse<AccountType>(dto.Type, true, out var accountType))
            return BadRequest(new { success = false, message = "نوع الحساب غير صحيح" });

        var account = new Account {
            Code = dto.Code, Name = dto.Name, Type = accountType,
            Branch = dto.Branch, ParentCode = dto.ParentCode,
            Description = dto.Description
        };
        db.Accounts.Add(account);
        await db.SaveChangesAsync();
        return Created("", new { success = true, account });
    }

    // PUT /api/accounts/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAccountDto dto)
    {
        var account = await db.Accounts.FindAsync(id);
        if (account is null) return NotFound(new { success = false, message = "الحساب غير موجود" });

        if (!string.IsNullOrWhiteSpace(dto.Name)) account.Name = dto.Name;
        if (!string.IsNullOrWhiteSpace(dto.Description)) account.Description = dto.Description;
        if (dto.IsActive.HasValue) account.IsActive = dto.IsActive.Value;

        await db.SaveChangesAsync();
        return Ok(new { success = true, account });
    }

    // DELETE /api/accounts/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var hasLines = await db.JournalLines.AnyAsync(l => l.AccountId == id);
        if (hasLines) return BadRequest(new { success = false, message = "لا يمكن حذف حساب له قيود" });

        var account = await db.Accounts.FindAsync(id);
        if (account is null) return NotFound();
        db.Accounts.Remove(account);
        await db.SaveChangesAsync();
        return Ok(new { success = true });
    }
}

public record CreateAccountDto(string Code, string Name, string Type, string Branch = "main", string? ParentCode = null, string? Description = null);
public record UpdateAccountDto(string? Name, string? Description, bool? IsActive);
