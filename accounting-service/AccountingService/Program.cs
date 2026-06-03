using Microsoft.EntityFrameworkCore;
using AccountingService.Data;
using AccountingService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(o => {
    o.JsonSerializerOptions.PropertyNamingPolicy = null;
});

builder.Services.AddDbContext<AccountingContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Data Source=accounting.db"));

builder.Services.AddScoped<AccountingBusinessService>();

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<AccountingContext>();
    db.Database.Migrate();
}

app.UseCors("AllowAll");
app.MapControllers();
app.MapGet("/health", () => new { status = "ok", service = "AccountingService-CSharp", version = "1.0" });
app.Run();
