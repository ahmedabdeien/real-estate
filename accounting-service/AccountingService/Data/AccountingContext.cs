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

        // Default Chart of Accounts
        SeedAccounts(b);
    }

    private static void SeedAccounts(ModelBuilder b)
    {
        b.Entity<Account>().HasData(
            // ═══ أصول ═══
            new Account { Id=1,  Code="1000", Name="الأصول المتداولة",         Type=AccountType.Asset,   Branch="main" },
            new Account { Id=2,  Code="1001", Name="الصندوق (نقدي)",           Type=AccountType.Asset,   Branch="main", ParentCode="1000" },
            new Account { Id=3,  Code="1002", Name="البنك الأهلي",             Type=AccountType.Asset,   Branch="main", ParentCode="1000" },
            new Account { Id=4,  Code="1003", Name="البنك التجاري الدولي",     Type=AccountType.Asset,   Branch="main", ParentCode="1000" },
            new Account { Id=5,  Code="1010", Name="العملاء / المدينون",       Type=AccountType.Asset,   Branch="main", ParentCode="1000" },
            new Account { Id=6,  Code="1020", Name="مخزون",                    Type=AccountType.Asset,   Branch="main", ParentCode="1000" },
            new Account { Id=7,  Code="1100", Name="الأصول الثابتة",           Type=AccountType.Asset,   Branch="main" },
            new Account { Id=8,  Code="1101", Name="عقارات ومباني",            Type=AccountType.Asset,   Branch="main", ParentCode="1100" },
            new Account { Id=9,  Code="1102", Name="سيارات وآليات",            Type=AccountType.Asset,   Branch="main", ParentCode="1100" },
            new Account { Id=10, Code="1103", Name="أجهزة ومعدات",            Type=AccountType.Asset,   Branch="main", ParentCode="1100" },
            // ═══ خصوم ═══
            new Account { Id=20, Code="2000", Name="الخصوم المتداولة",         Type=AccountType.Liability, Branch="main" },
            new Account { Id=21, Code="2001", Name="الموردون / الدائنون",     Type=AccountType.Liability, Branch="main", ParentCode="2000" },
            new Account { Id=22, Code="2002", Name="مصروفات مستحقة",          Type=AccountType.Liability, Branch="main", ParentCode="2000" },
            new Account { Id=23, Code="2003", Name="ضرائب مستحقة",            Type=AccountType.Liability, Branch="main", ParentCode="2000" },
            new Account { Id=24, Code="2100", Name="الخصوم طويلة الأجل",      Type=AccountType.Liability, Branch="main" },
            new Account { Id=25, Code="2101", Name="قروض بنكية",              Type=AccountType.Liability, Branch="main", ParentCode="2100" },
            // ═══ حقوق ملكية ═══
            new Account { Id=30, Code="3000", Name="حقوق الملكية",            Type=AccountType.Equity, Branch="main" },
            new Account { Id=31, Code="3001", Name="رأس المال",               Type=AccountType.Equity, Branch="main", ParentCode="3000" },
            new Account { Id=32, Code="3002", Name="الأرباح المحتجزة",        Type=AccountType.Equity, Branch="main", ParentCode="3000" },
            // ═══ إيرادات ═══
            new Account { Id=40, Code="4000", Name="الإيرادات",               Type=AccountType.Revenue, Branch="main" },
            new Account { Id=41, Code="4001", Name="إيرادات مبيعات وحدات",   Type=AccountType.Revenue, Branch="main", ParentCode="4000" },
            new Account { Id=42, Code="4002", Name="إيرادات إيجارات",        Type=AccountType.Revenue, Branch="main", ParentCode="4000" },
            new Account { Id=43, Code="4003", Name="إيرادات خدمات",          Type=AccountType.Revenue, Branch="main", ParentCode="4000" },
            new Account { Id=44, Code="4004", Name="إيرادات أخرى",           Type=AccountType.Revenue, Branch="main", ParentCode="4000" },
            // ═══ مصروفات ═══
            new Account { Id=50, Code="5000", Name="المصروفات التشغيلية",     Type=AccountType.Expense, Branch="main" },
            new Account { Id=51, Code="5001", Name="رواتب وأجور",            Type=AccountType.Expense, Branch="main", ParentCode="5000" },
            new Account { Id=52, Code="5002", Name="إيجارات مدفوعة",        Type=AccountType.Expense, Branch="main", ParentCode="5000" },
            new Account { Id=53, Code="5003", Name="كهرباء وماء",            Type=AccountType.Expense, Branch="main", ParentCode="5000" },
            new Account { Id=54, Code="5004", Name="مواصلات ووقود",          Type=AccountType.Expense, Branch="main", ParentCode="5000" },
            new Account { Id=55, Code="5005", Name="صيانة وإصلاح",           Type=AccountType.Expense, Branch="main", ParentCode="5000" },
            new Account { Id=56, Code="5006", Name="دعاية وإعلان",           Type=AccountType.Expense, Branch="main", ParentCode="5000" },
            new Account { Id=57, Code="5007", Name="مستلزمات مكتبية",        Type=AccountType.Expense, Branch="main", ParentCode="5000" },
            new Account { Id=58, Code="5100", Name="المصروفات الإدارية",      Type=AccountType.Expense, Branch="main" },
            new Account { Id=59, Code="5101", Name="مصاريف قانونية",         Type=AccountType.Expense, Branch="main", ParentCode="5100" },
            new Account { Id=60, Code="5102", Name="مصاريف محاسبية",         Type=AccountType.Expense, Branch="main", ParentCode="5100" },
            new Account { Id=61, Code="5103", Name="ضرائب ورسوم",            Type=AccountType.Expense, Branch="main", ParentCode="5100" },
            new Account { Id=62, Code="5200", Name="تكلفة المبيعات",          Type=AccountType.Expense, Branch="main" },
            new Account { Id=63, Code="5201", Name="تكلفة وحدات مباعة",      Type=AccountType.Expense, Branch="main", ParentCode="5200" }
        );
    }
}
