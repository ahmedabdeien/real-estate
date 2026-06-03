using AccountingService.Data;
using AccountingService.Models;
using Microsoft.EntityFrameworkCore;

namespace AccountingService.Services;

public static class SeedService
{
    public static async Task SeedDefaultAccountsAsync(AccountingContext db)
    {
        if (await db.Accounts.AnyAsync()) return; // Already seeded

        var accounts = new List<Account>
        {
            // ═══ أصول ═══
            new() { Code="1000", Name="الأصول المتداولة",         Type=AccountType.Asset,    Branch="main" },
            new() { Code="1001", Name="الصندوق (نقدي)",           Type=AccountType.Asset,    Branch="main", ParentCode="1000" },
            new() { Code="1002", Name="البنك الأهلي",             Type=AccountType.Asset,    Branch="main", ParentCode="1000" },
            new() { Code="1003", Name="البنك التجاري الدولي",     Type=AccountType.Asset,    Branch="main", ParentCode="1000" },
            new() { Code="1010", Name="العملاء / المدينون",       Type=AccountType.Asset,    Branch="main", ParentCode="1000" },
            new() { Code="1020", Name="مخزون",                    Type=AccountType.Asset,    Branch="main", ParentCode="1000" },
            new() { Code="1100", Name="الأصول الثابتة",           Type=AccountType.Asset,    Branch="main" },
            new() { Code="1101", Name="عقارات ومباني",            Type=AccountType.Asset,    Branch="main", ParentCode="1100" },
            new() { Code="1102", Name="سيارات وآليات",            Type=AccountType.Asset,    Branch="main", ParentCode="1100" },
            new() { Code="1103", Name="أجهزة ومعدات",            Type=AccountType.Asset,    Branch="main", ParentCode="1100" },
            // ═══ خصوم ═══
            new() { Code="2000", Name="الخصوم المتداولة",         Type=AccountType.Liability, Branch="main" },
            new() { Code="2001", Name="الموردون / الدائنون",      Type=AccountType.Liability, Branch="main", ParentCode="2000" },
            new() { Code="2002", Name="مصروفات مستحقة",          Type=AccountType.Liability, Branch="main", ParentCode="2000" },
            new() { Code="2003", Name="ضرائب مستحقة",            Type=AccountType.Liability, Branch="main", ParentCode="2000" },
            new() { Code="2100", Name="الخصوم طويلة الأجل",      Type=AccountType.Liability, Branch="main" },
            new() { Code="2101", Name="قروض بنكية",              Type=AccountType.Liability, Branch="main", ParentCode="2100" },
            // ═══ حقوق ملكية ═══
            new() { Code="3000", Name="حقوق الملكية",            Type=AccountType.Equity, Branch="main" },
            new() { Code="3001", Name="رأس المال",               Type=AccountType.Equity, Branch="main", ParentCode="3000" },
            new() { Code="3002", Name="الأرباح المحتجزة",        Type=AccountType.Equity, Branch="main", ParentCode="3000" },
            // ═══ إيرادات ═══
            new() { Code="4000", Name="الإيرادات",               Type=AccountType.Revenue, Branch="main" },
            new() { Code="4001", Name="إيرادات مبيعات وحدات",   Type=AccountType.Revenue, Branch="main", ParentCode="4000" },
            new() { Code="4002", Name="إيرادات إيجارات",        Type=AccountType.Revenue, Branch="main", ParentCode="4000" },
            new() { Code="4003", Name="إيرادات خدمات",          Type=AccountType.Revenue, Branch="main", ParentCode="4000" },
            new() { Code="4004", Name="إيرادات أخرى",           Type=AccountType.Revenue, Branch="main", ParentCode="4000" },
            // ═══ مصروفات ═══
            new() { Code="5000", Name="المصروفات التشغيلية",     Type=AccountType.Expense, Branch="main" },
            new() { Code="5001", Name="رواتب وأجور",            Type=AccountType.Expense, Branch="main", ParentCode="5000" },
            new() { Code="5002", Name="إيجارات مدفوعة",        Type=AccountType.Expense, Branch="main", ParentCode="5000" },
            new() { Code="5003", Name="كهرباء وماء",            Type=AccountType.Expense, Branch="main", ParentCode="5000" },
            new() { Code="5004", Name="مواصلات ووقود",          Type=AccountType.Expense, Branch="main", ParentCode="5000" },
            new() { Code="5005", Name="صيانة وإصلاح",           Type=AccountType.Expense, Branch="main", ParentCode="5000" },
            new() { Code="5006", Name="دعاية وإعلان",           Type=AccountType.Expense, Branch="main", ParentCode="5000" },
            new() { Code="5100", Name="المصروفات الإدارية",      Type=AccountType.Expense, Branch="main" },
            new() { Code="5101", Name="مصاريف قانونية",         Type=AccountType.Expense, Branch="main", ParentCode="5100" },
            new() { Code="5102", Name="مصاريف محاسبية",         Type=AccountType.Expense, Branch="main", ParentCode="5100" },
            new() { Code="5103", Name="ضرائب ورسوم",            Type=AccountType.Expense, Branch="main", ParentCode="5100" },
            new() { Code="5200", Name="تكلفة المبيعات",          Type=AccountType.Expense, Branch="main" },
            new() { Code="5201", Name="تكلفة وحدات مباعة",      Type=AccountType.Expense, Branch="main", ParentCode="5200" },
        };

        db.Accounts.AddRange(accounts);
        await db.SaveChangesAsync();
    }
}
