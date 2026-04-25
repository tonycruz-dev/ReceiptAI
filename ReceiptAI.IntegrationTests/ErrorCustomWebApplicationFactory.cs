using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Infrastructure.Persistence;

namespace ReceiptAI.IntegrationTests;

public class ErrorCustomWebApplicationFactory : WebApplicationFactory<Program>
{
	private static readonly InMemoryDatabaseRoot _databaseRoot = new();

	protected override void ConfigureWebHost(IWebHostBuilder builder)
	{
		builder.UseEnvironment("Testing");

		builder.ConfigureServices(services =>
		{
			services.RemoveAll(typeof(DbContextOptions<ApplicationDbContext>));
			services.RemoveAll(typeof(ApplicationDbContext));

			services.RemoveAll<IImageService>();
			services.RemoveAll<IReceiptExtractionService>();

			services.AddDbContext<ApplicationDbContext>(options =>
			{
				options.UseInMemoryDatabase("ReceiptAiErrorTestDb", _databaseRoot);
			});

			services.AddScoped<IImageService, FakeFailingImageService>();
			services.AddScoped<IReceiptExtractionService, FakeFailingReceiptExtractionService>();

			var sp = services.BuildServiceProvider();

			using var scope = sp.CreateScope();
			var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
			db.Database.EnsureDeleted();
			db.Database.EnsureCreated();
		});
	}
}
