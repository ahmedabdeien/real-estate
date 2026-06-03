using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AccountingService.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Code = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    ParentCode = table.Column<string>(type: "TEXT", nullable: true),
                    Branch = table.Column<string>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JournalEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EntryNumber = table.Column<string>(type: "TEXT", nullable: false),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Reference = table.Column<string>(type: "TEXT", nullable: true),
                    Branch = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PostedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ReversedFromId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JournalEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JournalLines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    JournalEntryId = table.Column<int>(type: "INTEGER", nullable: false),
                    AccountId = table.Column<int>(type: "INTEGER", nullable: false),
                    Debit = table.Column<decimal>(type: "TEXT", nullable: false),
                    Credit = table.Column<decimal>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    Order = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JournalLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JournalLines_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JournalLines_JournalEntries_JournalEntryId",
                        column: x => x.JournalEntryId,
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Accounts",
                columns: new[] { "Id", "Branch", "Code", "CreatedAt", "Description", "IsActive", "Name", "ParentCode", "Type" },
                values: new object[,]
                {
                    { 1, "main", "1000", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(4690), null, true, "الأصول المتداولة", null, "Asset" },
                    { 2, "main", "1001", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5250), null, true, "الصندوق (نقدي)", "1000", "Asset" },
                    { 3, "main", "1002", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5410), null, true, "البنك الأهلي", "1000", "Asset" },
                    { 4, "main", "1003", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "البنك التجاري الدولي", "1000", "Asset" },
                    { 5, "main", "1010", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "العملاء / المدينون", "1000", "Asset" },
                    { 6, "main", "1020", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "مخزون", "1000", "Asset" },
                    { 7, "main", "1100", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "الأصول الثابتة", null, "Asset" },
                    { 8, "main", "1101", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "عقارات ومباني", "1100", "Asset" },
                    { 9, "main", "1102", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "سيارات وآليات", "1100", "Asset" },
                    { 10, "main", "1103", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "أجهزة ومعدات", "1100", "Asset" },
                    { 20, "main", "2000", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "الخصوم المتداولة", null, "Liability" },
                    { 21, "main", "2001", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "الموردون / الدائنون", "2000", "Liability" },
                    { 22, "main", "2002", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "مصروفات مستحقة", "2000", "Liability" },
                    { 23, "main", "2003", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "ضرائب مستحقة", "2000", "Liability" },
                    { 24, "main", "2100", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "الخصوم طويلة الأجل", null, "Liability" },
                    { 25, "main", "2101", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "قروض بنكية", "2100", "Liability" },
                    { 30, "main", "3000", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "حقوق الملكية", null, "Equity" },
                    { 31, "main", "3001", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "رأس المال", "3000", "Equity" },
                    { 32, "main", "3002", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5420), null, true, "الأرباح المحتجزة", "3000", "Equity" },
                    { 40, "main", "4000", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5430), null, true, "الإيرادات", null, "Revenue" },
                    { 41, "main", "4001", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5430), null, true, "إيرادات مبيعات وحدات", "4000", "Revenue" },
                    { 42, "main", "4002", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5430), null, true, "إيرادات إيجارات", "4000", "Revenue" },
                    { 43, "main", "4003", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5430), null, true, "إيرادات خدمات", "4000", "Revenue" },
                    { 44, "main", "4004", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5430), null, true, "إيرادات أخرى", "4000", "Revenue" },
                    { 50, "main", "5000", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5430), null, true, "المصروفات التشغيلية", null, "Expense" },
                    { 51, "main", "5001", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5430), null, true, "رواتب وأجور", "5000", "Expense" },
                    { 52, "main", "5002", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5430), null, true, "إيجارات مدفوعة", "5000", "Expense" },
                    { 53, "main", "5003", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5440), null, true, "كهرباء وماء", "5000", "Expense" },
                    { 54, "main", "5004", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5440), null, true, "مواصلات ووقود", "5000", "Expense" },
                    { 55, "main", "5005", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5440), null, true, "صيانة وإصلاح", "5000", "Expense" },
                    { 56, "main", "5006", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5440), null, true, "دعاية وإعلان", "5000", "Expense" },
                    { 57, "main", "5007", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5440), null, true, "مستلزمات مكتبية", "5000", "Expense" },
                    { 58, "main", "5100", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5440), null, true, "المصروفات الإدارية", null, "Expense" },
                    { 59, "main", "5101", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5440), null, true, "مصاريف قانونية", "5100", "Expense" },
                    { 60, "main", "5102", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5440), null, true, "مصاريف محاسبية", "5100", "Expense" },
                    { 61, "main", "5103", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5440), null, true, "ضرائب ورسوم", "5100", "Expense" },
                    { 62, "main", "5200", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5440), null, true, "تكلفة المبيعات", null, "Expense" },
                    { 63, "main", "5201", new DateTime(2026, 6, 3, 13, 24, 41, 658, DateTimeKind.Utc).AddTicks(5440), null, true, "تكلفة وحدات مباعة", "5200", "Expense" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_Code_Branch",
                table: "Accounts",
                columns: new[] { "Code", "Branch" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_EntryNumber_Branch",
                table: "JournalEntries",
                columns: new[] { "EntryNumber", "Branch" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JournalLines_AccountId",
                table: "JournalLines",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalLines_JournalEntryId",
                table: "JournalLines",
                column: "JournalEntryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JournalLines");

            migrationBuilder.DropTable(
                name: "Accounts");

            migrationBuilder.DropTable(
                name: "JournalEntries");
        }
    }
}
