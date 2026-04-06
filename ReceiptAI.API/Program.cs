using Scalar.AspNetCore;
using ReceiptAI.Infrastructure;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowFrontend", policy =>
	{
		policy
			.WithOrigins("https://localhost:3000", "https://43pdr2fc-7134.uks1.devtunnels.ms")
			.AllowAnyHeader()
			.AllowAnyMethod();
	});
});

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddInfrastructure(builder.Configuration);
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseCors("AllowFrontend");
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.MapOpenApi();
}

app.MapScalarApiReference(options =>
{
	options
		.WithTitle("ReceiptAI API")
		.WithTheme(ScalarTheme.DeepSpace); // Optional theme
});

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
