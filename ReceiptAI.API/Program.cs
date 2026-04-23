using ReceiptAI.Infrastructure;
using ReceiptAI.Infrastructure.Mcp.Prompts;
using ReceiptAI.Infrastructure.Mcp.Resources;
using ReceiptAI.Infrastructure.Mcp.Tools;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddOpenApi();

builder.Services
	.AddMcpServer()
	.WithHttpTransport(options =>
	{
		//options.EnableLegacySse = true;
		options.Stateless = true;
	})
	.WithToolsFromAssembly(typeof(McpReceiptTool).Assembly)
	.WithResources<McpReceiptResources>()
	.WithPromptsFromAssembly(typeof(ReceiptPrompts).Assembly)
	.WithPromptsFromAssembly(typeof(McpReceiptPrompts).Assembly);


builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowFrontend", policy =>
	{
		policy
			.WithOrigins("http://localhost:3000", "https://localhost:3000")
			.AllowAnyHeader()
			.AllowAnyMethod();
	});
});
var app = builder.Build();

app.UseCors("AllowFrontend");
if (app.Environment.IsDevelopment())
{
	app.MapOpenApi();
}

app.MapMcp("/mcp");

app.MapScalarApiReference(options =>
{
	options.WithTitle("ReceiptAI API")
		   .WithTheme(ScalarTheme.DeepSpace);
});

// Temporarily disable while testing MCP locally
app.UseHttpsRedirection();

app.UseAuthorization();
app.MapControllers();

app.Run();