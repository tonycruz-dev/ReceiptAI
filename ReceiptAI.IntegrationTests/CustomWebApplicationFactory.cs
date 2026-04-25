using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Infrastructure.Persistence;

namespace ReceiptAI.IntegrationTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
	private SqliteConnection? _connection;

	protected override void ConfigureWebHost(IWebHostBuilder builder)
	{
		builder.UseEnvironment("Testing");

		builder.ConfigureServices(services =>
		{
			services.RemoveAll(typeof(DbContextOptions<ApplicationDbContext>));
			services.RemoveAll<ApplicationDbContext>();

			services.RemoveAll<IImageService>();
			services.RemoveAll<IReceiptExtractionService>();

			_connection = new SqliteConnection("DataSource=:memory:");
			_connection.Open();

			services.AddDbContext<ApplicationDbContext>(options =>
				options.UseSqlite(_connection));

			services.AddScoped<IImageService, FakeImageService>();
			services.AddScoped<IReceiptExtractionService, FakeReceiptExtractionService>();

			using var sp = services.BuildServiceProvider();
			using var scope = sp.CreateScope();

			var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
			db.Database.EnsureDeleted();
			db.Database.EnsureCreated();
		});
	}

	protected override void Dispose(bool disposing)
	{
		base.Dispose(disposing);

		if (disposing)
		{
			_connection?.Dispose();
		}
	}
	//private static readonly InMemoryDatabaseRoot _databaseRoot = new();

	//protected override void ConfigureWebHost(IWebHostBuilder builder)
	//{
	//	builder.UseEnvironment("Testing");

	//	builder.ConfigureServices(services =>
	//	{
	//		services.RemoveAll(typeof(DbContextOptions<ApplicationDbContext>));
	//		services.RemoveAll(typeof(ApplicationDbContext));

	//		services.RemoveAll<IImageService>();
	//		services.RemoveAll<IReceiptExtractionService>();

	//		services.AddDbContext<ApplicationDbContext>(options =>
	//		{
	//			options.UseInMemoryDatabase("ReceiptAiTestDb", _databaseRoot);
	//		});

	//		services.AddScoped<IImageService, FakeImageService>();
	//		services.AddScoped<IReceiptExtractionService, FakeReceiptExtractionService>();

	//		var sp = services.BuildServiceProvider();

	//		using var scope = sp.CreateScope();
	//		var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
	//		db.Database.EnsureDeleted();
	//		db.Database.EnsureCreated();
	//	});
	//}
}
