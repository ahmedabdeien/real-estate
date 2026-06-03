namespace AccountingService.Models;

public enum EntryStatus { Draft, Posted, Reversed }

public class JournalEntry
{
    public int Id { get; set; }
    public string EntryNumber { get; set; } = "";  // e.g. "JE-2024-0001"
    public DateTime Date { get; set; }
    public string Description { get; set; } = "";
    public string? Reference { get; set; }          // Invoice/Contract number
    public string Branch { get; set; } = "main";
    public EntryStatus Status { get; set; } = EntryStatus.Draft;
    public string CreatedBy { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PostedAt { get; set; }
    public int? ReversedFromId { get; set; }        // If this reverses another entry
    public ICollection<JournalEntryLine> Lines { get; set; } = [];

    // Computed
    public decimal TotalDebit  => Lines.Sum(l => l.Debit);
    public decimal TotalCredit => Lines.Sum(l => l.Credit);
    public bool IsBalanced     => TotalDebit == TotalCredit;
}

public class JournalEntryLine
{
    public int Id { get; set; }
    public int JournalEntryId { get; set; }
    public JournalEntry JournalEntry { get; set; } = null!;
    public int AccountId { get; set; }
    public Account Account { get; set; } = null!;
    public decimal Debit  { get; set; }
    public decimal Credit { get; set; }
    public string? Description { get; set; }
    public int Order { get; set; }
}
