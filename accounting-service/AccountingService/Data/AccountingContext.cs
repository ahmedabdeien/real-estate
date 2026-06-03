using Microsoft.EntityFrameworkCore;
using AccountingService.Models;

namespace AccountingService.Data;

public class AccountingContext(DbContextOptions<AccountingContext> options) : DbContext(options)
{
    public DbSet<Account>          Accounts       { get; set; }
    public DbSet<JournalEntry>     JournalEntries { get; set; }
    public DbSet<JournalEntryLine> JournalLines   { get; set; }

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Account>(e => {
            e.HasIndex(a => new { a.Code, a.Branch }).IsUnique();
            e.Property(a => a.Type).HasConversion<string>();
        });

        b.Entity<JournalEntry>(e => {
            e.HasIndex(j => new { j.EntryNumber, j.Branch }).IsUnique();
            e.Property(j => j.Status).HasConversion<string>();
            e.Ignore(j => j.TotalDebit);
            e.Ignore(j => j.TotalCredit);
            e.Ignore(j => j.IsBalanced);
        });

        b.Entity<JournalEntryLine>(e => {
            e.HasOne(l => l.JournalEntry).WithMany(j => j.Lines).HasForeignKey(l => l.JournalEntryId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(l => l.Account).WithMany(a => a.Lines).HasForeignKey(l => l.AccountId);
        });
    }
}
