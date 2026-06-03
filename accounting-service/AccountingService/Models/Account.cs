namespace AccountingService.Models;

public enum AccountType { Asset, Liability, Equity, Revenue, Expense }

public class Account
{
    public int Id { get; set; }
    public string Code { get; set; } = "";        // e.g. "1001"
    public string Name { get; set; } = "";         // e.g. "الصندوق"
    public AccountType Type { get; set; }
    public string TypeAr => Type switch {
        AccountType.Asset     => "أصول",
        AccountType.Liability => "خصوم",
        AccountType.Equity    => "حقوق ملكية",
        AccountType.Revenue   => "إيرادات",
        AccountType.Expense   => "مصروفات",
        _ => ""
    };
    public string? ParentCode { get; set; }        // For sub-accounts
    public string Branch { get; set; } = "main";
    public bool IsActive { get; set; } = true;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<JournalEntryLine> Lines { get; set; } = [];
}
