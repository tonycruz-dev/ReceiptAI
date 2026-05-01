using Microsoft.Extensions.DependencyInjection;
using ReceiptAI.Application.Common.Models;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Infrastructure.Persistence;
using System.Net;
using System.Net.Http.Json;

namespace ReceiptAI.IntegrationTests;

public class ReceiptsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
	private readonly HttpClient _client;
	private readonly CustomWebApplicationFactory _factory;

	public ReceiptsControllerTests(CustomWebApplicationFactory factory)
	{
		_factory = factory;
		_client = factory.CreateClient();
	}

	[Fact]
	public async Task Create_Should_Return_Created_And_Save_Receipt()
	{
		await ResetDatabaseAsync();
		// Arrange
		var request = new CreateReceiptForApiRequest
		{
			MerchantName = "Tesco",
			PurchaseDate = DateTime.UtcNow.AddDays(-1),
			TotalAmount = 25.50m,
			Currency = "GBP",
			Category = "Groceries",
			ImageUrl = "https://example.com/receipt.jpg",
			ImagePublicId = "img_123"
		};

		// Act
		var response = await _client.PostAsJsonAsync("/api/receipts", request);

		// Assert response
		Assert.Equal(HttpStatusCode.Created, response.StatusCode);

		var createdId = await response.Content.ReadFromJsonAsync<Guid>();
		Assert.NotEqual(Guid.Empty, createdId);

		// Assert DB
		using var scope = _factory.Services.CreateScope();
		var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

		var allReceipts = db.Receipts.ToList();
		Assert.NotEmpty(allReceipts);

		var savedReceipt = await db.Receipts.FindAsync(createdId);

		Assert.NotNull(savedReceipt);
		Assert.Equal("Tesco", savedReceipt!.MerchantName);
		Assert.Equal(25.50m, savedReceipt.TotalAmount);
		Assert.Equal("Groceries", savedReceipt.Category);
		
	}

	[Fact]
	public async Task GetAll_Should_Return_All_Receipts()
	{
		await ResetDatabaseAsync();

		// Arrange
		using (var scope = _factory.Services.CreateScope())
		{
			var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Tesco",
				new DateTime(2025, 1, 10),
				25.50m,
				"https://example.com/receipt1.jpg",
				"img_1",
				"GBP",
				"Groceries"));

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Uber",
				new DateTime(2025, 1, 11),
				14.99m,
				"https://example.com/receipt2.jpg",
				"img_2",
				"GBP",
				"Transport"));

			await db.SaveChangesAsync();
		}

		// Act
		var response = await _client.GetAsync("/api/receipts");

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var result = await response.Content.ReadFromJsonAsync<PagedResult<ResponseReceiptDto>>();

		Assert.NotNull(result);
		Assert.NotNull(result!.Items);

		Assert.True(result.Items.Count >= 2);
		Assert.Contains(result.Items, r => r.MerchantName == "Tesco");
		Assert.Contains(result.Items, r => r.MerchantName == "Uber");

		Assert.Equal(1, result.PageNumber);
		Assert.Equal(20, result.PageSize);
		Assert.True(result.TotalCount >= 2);
	}

	[Fact]
	public async Task GetById_Should_Return_Receipt_When_It_Exists()
	{
		await ResetDatabaseAsync();
		Guid id;

		// Arrange
		using (var scope = _factory.Services.CreateScope())
		{
			var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

			var receipt = new ReceiptAI.Domain.Entities.Receipt(
				"Lidl",
				new DateTime(2025, 1, 12),
				18.75m,
				"https://example.com/receipt3.jpg",
				"img_3",
				"GBP",
				"Groceries");

			db.Receipts.Add(receipt);
			await db.SaveChangesAsync();

			id = receipt.Id;
		}

		// Act
		var response = await _client.GetAsync($"/api/receipts/{id}");

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var receiptDto = await response.Content.ReadFromJsonAsync<ResponseReceiptDto>();

		Assert.NotNull(receiptDto);
		Assert.Equal(id, receiptDto!.Id);
		Assert.Equal("Lidl", receiptDto.MerchantName);
		Assert.Equal(18.75m, receiptDto.TotalAmount);
		Assert.Equal("Groceries", receiptDto.Category);
		
	}

	[Fact]
	public async Task GetById_Should_Return_NotFound_When_Receipt_Does_Not_Exist()
	{
		await ResetDatabaseAsync();
		// Act
		var response = await _client.GetAsync($"/api/receipts/{Guid.NewGuid()}");

		// Assert
		Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
		
	}

	[Fact]
	public async Task Delete_Should_Return_NoContent_When_Receipt_Exists()
	{
		await ResetDatabaseAsync();
		Guid id;

		// Arrange
		using (var scope = _factory.Services.CreateScope())
		{
			var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

			var receipt = new ReceiptAI.Domain.Entities.Receipt(
				"Aldi",
				new DateTime(2025, 1, 13),
				30.00m,
				"https://example.com/receipt4.jpg",
				"img_4",
				"GBP",
				"Groceries");

			db.Receipts.Add(receipt);
			await db.SaveChangesAsync();

			id = receipt.Id;
		}

		// Act
		var response = await _client.DeleteAsync($"/api/receipts/{id}");

		// Assert
		Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

		using var verifyScope = _factory.Services.CreateScope();
		var verifyDb = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
		var deletedReceipt = await verifyDb.Receipts.FindAsync(id);

		Assert.Null(deletedReceipt);
		
	}

	[Fact]
	public async Task Delete_Should_Return_NotFound_When_Receipt_Does_Not_Exist()
	{
		await ResetDatabaseAsync();
		// Act
		var response = await _client.DeleteAsync($"/api/receipts/{Guid.NewGuid()}");

		// Assert
		Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
		
	}

	[Fact]
	public async Task GetByCategory_Should_Return_Only_Matching_Receipts()
	{
		await ResetDatabaseAsync();
		// Arrange
		using (var scope = _factory.Services.CreateScope())
		{
			var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Tesco",
				new DateTime(2025, 1, 10),
				25.50m,
				"https://example.com/receipt1.jpg",
				"img_1",
				"GBP",
				"Groceries"));

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Uber",
				new DateTime(2025, 1, 11),
				14.99m,
				"https://example.com/receipt2.jpg",
				"img_2",
				"GBP",
				"Transport"));

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Aldi",
				new DateTime(2025, 1, 12),
				30.00m,
				"https://example.com/receipt3.jpg",
				"img_3",
				"GBP",
				"Groceries"));

			await db.SaveChangesAsync();
		}

		// Act
		var response = await _client.GetAsync("/api/receipts/category/Groceries");

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var receipts = await response.Content.ReadFromJsonAsync<List<ResponseReceiptDto>>();

		Assert.NotNull(receipts);
		Assert.Equal(2, receipts!.Count);
		Assert.All(receipts, r => Assert.Equal("Groceries", r.Category));
		
	}

	[Fact]
	public async Task GetByDateRange_Should_Return_Receipts_Within_Range()
	{
		await ResetDatabaseAsync();
		// Arrange
		using (var scope = _factory.Services.CreateScope())
		{
			var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Tesco",
				new DateTime(2025, 1, 10),
				25.50m,
				"https://example.com/receipt1.jpg",
				"img_1",
				"GBP",
				"Groceries"));

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Uber",
				new DateTime(2025, 1, 15),
				14.99m,
				"https://example.com/receipt2.jpg",
				"img_2",
				"GBP",
				"Transport"));

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Aldi",
				new DateTime(2025, 2, 1),
				30.00m,
				"https://example.com/receipt3.jpg",
				"img_3",
				"GBP",
				"Groceries"));

			await db.SaveChangesAsync();
		}

		// Act
		var response = await _client.GetAsync("/api/receipts/date-range?from=2025-01-01&to=2025-01-31");

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var receipts = await response.Content.ReadFromJsonAsync<List<ResponseReceiptDto>>();

		Assert.NotNull(receipts);
		Assert.Equal(2, receipts!.Count);
		Assert.DoesNotContain(receipts, r => r.MerchantName == "Aldi");
		
	}

	[Fact]
	public async Task GetByDateRange_Should_Return_BadRequest_When_From_Date_Is_Invalid()
	{
		await ResetDatabaseAsync();
		// Act
		var response = await _client.GetAsync("/api/receipts/date-range?from=not-a-date&to=2025-01-31");

		// Assert
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
		
	}

	[Fact]
	public async Task GetSummary_Should_Return_Correct_Summary()
	{
		await ResetDatabaseAsync();
		// Arrange
		using (var scope = _factory.Services.CreateScope())
		{
			var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Tesco",
				new DateTime(2025, 1, 10),
				25.50m,
				"https://example.com/receipt1.jpg",
				"img_1",
				"GBP",
				"Groceries"));

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Uber",
				new DateTime(2025, 1, 11),
				14.50m,
				"https://example.com/receipt2.jpg",
				"img_2",
				"GBP",
				"Transport"));

			await db.SaveChangesAsync();
		}

		// Act
		var response = await _client.GetAsync("/api/receipts/summary");

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var summary = await response.Content.ReadFromJsonAsync<ReceiptSummaryDto>();

		Assert.NotNull(summary);

		// Adjust these assertions to match your actual DTO properties
		Assert.Equal(2, summary!.TotalReceipts);
		Assert.Equal(40.00m, summary.TotalAmount);
		
	}
	[Fact]
	public async Task GetRecent_Should_Return_Only_Requested_Number_Of_Receipts()
	{

		await ResetDatabaseAsync();
		// Arrange
		using (var scope = _factory.Services.CreateScope())
		{
			var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Tesco",
				new DateTime(2025, 1, 10),
				25.50m,
				"https://example.com/receipt1.jpg",
				"img_1",
				"GBP",
				"Groceries")
			{
				CreatedAt = new DateTime(2025, 1, 10, 10, 0, 0, DateTimeKind.Utc)
			});

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Uber",
				new DateTime(2025, 1, 11),
				14.99m,
				"https://example.com/receipt2.jpg",
				"img_2",
				"GBP",
				"Transport")
			{
				CreatedAt = new DateTime(2025, 1, 11, 10, 0, 0, DateTimeKind.Utc)
			});

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Aldi",
				new DateTime(2025, 1, 12),
				30.00m,
				"https://example.com/receipt3.jpg",
				"img_3",
				"GBP",
				"Groceries")
			{
				CreatedAt = new DateTime(2025, 1, 12, 10, 0, 0, DateTimeKind.Utc)
			});

			await db.SaveChangesAsync();
		}

		// Act
		var response = await _client.GetAsync("/api/receipts/recent?count=2");

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var receipts = await response.Content.ReadFromJsonAsync<List<ResponseReceiptDto>>();

		Assert.NotNull(receipts);
		Assert.Equal(2, receipts!.Count);

		// Adjust these if your sorting logic differs
		Assert.Equal("Aldi", receipts[0].MerchantName);
		Assert.Equal("Uber", receipts[1].MerchantName);
		
	}
	[Fact]
	public async Task GetReceiptsByDate_Should_Return_Only_Receipts_For_That_Date()
	{

		await ResetDatabaseAsync();
		// Arrange
		using (var scope = _factory.Services.CreateScope())
		{
			var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Tesco",
				new DateTime(2025, 1, 10),
				25.50m,
				"https://example.com/receipt1.jpg",
				"img_1",
				"GBP",
				"Groceries"));

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Uber",
				new DateTime(2025, 1, 10),
				14.99m,
				"https://example.com/receipt2.jpg",
				"img_2",
				"GBP",
				"Transport"));

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Aldi",
				new DateTime(2025, 1, 11),
				30.00m,
				"https://example.com/receipt3.jpg",
				"img_3",
				"GBP",
				"Groceries"));

			await db.SaveChangesAsync();
		}

		// Act
		var response = await _client.GetAsync("/api/receipts/by-date/2025-01-10");

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var receipts = await response.Content.ReadFromJsonAsync<List<ResponseReceiptDto>>();

		Assert.NotNull(receipts);
		Assert.Equal(2, receipts!.Count);
		Assert.Contains(receipts, r => r.MerchantName == "Tesco");
		Assert.Contains(receipts, r => r.MerchantName == "Uber");
		Assert.DoesNotContain(receipts, r => r.MerchantName == "Aldi");
		
	}
	[Fact]
	public async Task GetReceiptsByDate_Should_Return_BadRequest_When_Date_Is_Invalid()
	{

		await ResetDatabaseAsync();
		// Act
		var response = await _client.GetAsync("/api/receipts/by-date/not-a-date");

		// Assert
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
		
	}
	[Fact]
	public async Task GetThisMonthReceipts_Should_Return_Only_Current_Month_Receipts()
	{

		await ResetDatabaseAsync();
		var now = DateTime.UtcNow;
		var thisMonthDate = new DateTime(now.Year, now.Month, 10);
		var previousMonthDate = thisMonthDate.AddMonths(-1);

		// Arrange
		using (var scope = _factory.Services.CreateScope())
		{
			var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Tesco",
				thisMonthDate,
				25.50m,
				"https://example.com/receipt1.jpg",
				"img_1",
				"GBP",
				"Groceries"));

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Uber",
				thisMonthDate.AddDays(2),
				14.99m,
				"https://example.com/receipt2.jpg",
				"img_2",
				"GBP",
				"Transport"));

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Aldi",
				previousMonthDate,
				30.00m,
				"https://example.com/receipt3.jpg",
				"img_3",
				"GBP",
				"Groceries"));

			await db.SaveChangesAsync();
		}

		// Act
		var response = await _client.GetAsync("/api/receipts/this-month");

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var receipts = await response.Content.ReadFromJsonAsync<List<ResponseReceiptDto>>();

		Assert.NotNull(receipts);
		Assert.Equal(2, receipts!.Count);
		Assert.Contains(receipts, r => r.MerchantName == "Tesco");
		Assert.Contains(receipts, r => r.MerchantName == "Uber");
		Assert.DoesNotContain(receipts, r => r.MerchantName == "Aldi");
		
	}
	[Fact]
	public async Task UploadImage_Should_Return_Ok_When_File_Is_Valid()
	{
		await ResetDatabaseAsync();

		// Arrange
		using var content = new MultipartFormDataContent();
		using var fileContent = new ByteArrayContent(new byte[] { 1, 2, 3, 4 });

		fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
		content.Add(fileContent, "file", "receipt.jpg");

		// Act
		var response = await _client.PostAsync("/api/receipts/upload-image", content);

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var result = await response.Content.ReadFromJsonAsync<ImageUploadResultDto>();

		Assert.NotNull(result);
		Assert.Equal("https://fake.test/uploaded-image.jpg", result!.Url);
		Assert.Equal("fake_public_id", result.PublicId);
		Assert.True(string.IsNullOrWhiteSpace(result.Error));
	}
	[Fact]
	public async Task UploadImage_Should_Return_BadRequest_When_File_Is_Missing()
	{
		await ResetDatabaseAsync();

		// Arrange
		using var content = new MultipartFormDataContent();

		// Act
		var response = await _client.PostAsync("/api/receipts/upload-image", content);

		// Assert
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
	}
	[Fact]
	public async Task Extract_Should_Return_Ok_When_ImageUrl_Is_Valid()
	{
		await ResetDatabaseAsync();

		// Arrange
		var request = new ExtractReceiptRequest
		{
			ImageUrl = "https://example.com/receipt.jpg"
		};

		// Act
		var response = await _client.PostAsJsonAsync("/api/receipts/extract", request);

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var result = await response.Content.ReadFromJsonAsync<ReceiptExtractionResultDto>();

		Assert.NotNull(result);
		Assert.Equal("Mock Store", result!.MerchantName);
		Assert.Equal(12.99m, result.TotalAmount);
		Assert.Equal("GBP", result.Currency);
		Assert.Equal("Groceries", result.Category);
		Assert.Equal("Mock receipt text", result.RawText);
		Assert.Null(result.ErrorMessage);
	}
	[Fact]
	public async Task Extract_Should_Return_BadRequest_When_ImageUrl_Is_Missing()
	{
		await ResetDatabaseAsync();

		// Arrange
		var request = new ExtractReceiptRequest
		{
			ImageUrl = ""
		};

		// Act
		var response = await _client.PostAsJsonAsync("/api/receipts/extract", request);

		// Assert
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
	}
	[Fact]
	public async Task GetReceipts_Should_Return_Paged_Receipts()
	{
		await ResetDatabaseAsync();

		// Arrange
		using (var scope = _factory.Services.CreateScope())
		{
			var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Tesco",
				new DateTime(2025, 1, 10),
				25.50m,
				"https://example.com/receipt1.jpg",
				"img_1",
				"GBP",
				"Groceries"));

			db.Receipts.Add(new ReceiptAI.Domain.Entities.Receipt(
				"Uber",
				new DateTime(2025, 1, 11),
				14.99m,
				"https://example.com/receipt2.jpg",
				"img_2",
				"GBP",
				"Transport"));

			await db.SaveChangesAsync();
		}

		// Act
		var response = await _client.GetAsync("/api/receipts");

		// Assert
		Assert.Equal(HttpStatusCode.OK, response.StatusCode);

		var result = await response.Content.ReadFromJsonAsync<PagedResult<ResponseReceiptDto>>();

		Assert.NotNull(result);
		Assert.NotNull(result!.Items);

		Assert.True(result.Items.Count >= 2);
		Assert.Contains(result.Items, r => r.MerchantName == "Tesco");
		Assert.Contains(result.Items, r => r.MerchantName == "Uber");

		Assert.Equal(1, result.PageNumber);
		Assert.Equal(20, result.PageSize);
		Assert.True(result.TotalCount >= 2);
	}
	private async Task ResetDatabaseAsync()
	{
		using var scope = _factory.Services.CreateScope();
		var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

		await db.Database.EnsureDeletedAsync();
		await db.Database.EnsureCreatedAsync();
	}
}