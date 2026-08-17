using Microsoft.AspNetCore.HttpOverrides;
using ReceiptAI.Infrastructure;
using ReceiptAI.Infrastructure.Mcp.Prompts;
using ReceiptAI.Infrastructure.Mcp.Resources;
using ReceiptAI.Infrastructure.Mcp.Tools;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);
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
	.WithPromptsFromAssembly(typeof(ReceiptPrompts).Assembly);



builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowFrontend", policy =>
	{
		policy
			.WithOrigins("http://localhost:3000", "https://localhost:3000", "https://localhost:3001")
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

var allowUnauthenticatedMcp =
	app.Environment.IsDevelopment() ||
	app.Configuration.GetValue<bool>("Mcp:AllowUnauthenticated");

if (allowUnauthenticatedMcp)
{
	app.Logger.LogWarning(
		"The MCP endpoint is enabled without application authentication. " +
		"Keep it private or configure authentication before external exposure.");
	app.MapMcp("/mcp");
}
else
{
	app.Logger.LogWarning(
		"The MCP endpoint is disabled outside Development. " +
		"Set Mcp:AllowUnauthenticated=true only for an explicitly protected environment.");
}

//app.UseForwardedHeaders(new ForwardedHeadersOptions
//{
//	ForwardedHeaders =
//		ForwardedHeaders.XForwardedHost |
//		ForwardedHeaders.XForwardedProto
//});

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

public partial class Program { }
