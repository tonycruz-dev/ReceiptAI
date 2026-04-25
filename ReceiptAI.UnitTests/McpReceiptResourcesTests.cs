using System;
using System.Collections.Generic;
using System.Text;

namespace ReceiptAI.UnitTests;

using ModelContextProtocol;
using Moq;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Domain.Entities;
using ReceiptAI.Infrastructure.Mcp.Resources;
using System.Text.Json;


public class McpReceiptResourcesTests
{
	private readonly Mock<IReceiptRepository> _receiptRepositoryMock;
	private readonly McpReceiptResources _resources;

	public McpReceiptResourcesTests()
	{
		_receiptRepositoryMock = new Mock<IReceiptRepository>();
		_resources = new McpReceiptResources(_receiptRepositoryMock.Object);
	}

	[Fact]
	public async Task GetRecentReceiptsAsync_Should_Throw_When_Count_Is_Less_Than_Or_Equal_To_Zero()
	{
		// Act
		var action = async () => await _resources.GetRecentReceiptsAsync(0);

		// Assert
		var exception = await Assert.ThrowsAsync<McpException>(action);
		Assert.Equal("Count must be greater than 0.", exception.Message);
	}

	[Fact]
	public async Task GetReceiptByIdAsync_Should_Throw_When_Receipt_Is_Not_Found()
	{
		// Arrange
		var id = Guid.NewGuid();

		_receiptRepositoryMock
			.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
			.ReturnsAsync((Receipt?)null);

		// Act
		var action = async () => await _resources.GetReceiptByIdAsync(id);

		// Assert
		var exception = await Assert.ThrowsAsync<McpException>(action);
		Assert.Equal($"Receipt not found: {id}", exception.Message);
	}

	[Fact]
	public async Task GetReceiptsByCategoryAsync_Should_Throw_When_Category_Is_Empty()
	{
		// Act
		var action = async () => await _resources.GetReceiptsByCategoryAsync("");

		// Assert
		var exception = await Assert.ThrowsAsync<McpException>(action);
		Assert.Equal("Category is required.", exception.Message);
	}

	[Fact]
	public async Task GetReceiptsByDateAsync_Should_Throw_When_Date_Is_Invalid()
	{
		// Act
		var action = async () => await _resources.GetReceiptsByDateAsync("not-a-date");

		// Assert
		var exception = await Assert.ThrowsAsync<McpException>(action);
		Assert.Equal("Invalid date format. Use YYYY-MM-DD.", exception.Message);
	}

	[Fact]
	public async Task GetReceiptByIdAsync_Should_Return_TextResourceContents_With_Json()
	{
		// Arrange
		var receipt = new Receipt(
			"Tesco",
			new DateTime(2025, 1, 10),
			25.50m,
			"https://example.com/receipt.jpg",
			"img_123",
			"GBP",
			"Groceries");

		_receiptRepositoryMock
			.Setup(r => r.GetByIdAsync(receipt.Id, It.IsAny<CancellationToken>()))
			.ReturnsAsync(receipt);

		// Act
		var result = await _resources.GetReceiptByIdAsync(receipt.Id);

		// Assert
		Assert.NotNull(result);
		Assert.Equal($"receipt://by-id/{receipt.Id}", result.Uri);
		Assert.Equal("application/json", result.MimeType);
		Assert.False(string.IsNullOrWhiteSpace(result.Text));

		var json = JsonDocument.Parse(result.Text);

		Assert.Equal("Tesco", json.RootElement.GetProperty("merchantName").GetString());
		Assert.Equal("Groceries", json.RootElement.GetProperty("category").GetString());
		Assert.Equal("GBP", json.RootElement.GetProperty("currency").GetString());
		Assert.Equal(25.50m, json.RootElement.GetProperty("totalAmount").GetDecimal());
	}

	[Fact]
	public async Task GetAllReceiptsAsync_Should_Return_Ordered_Results()
	{
		// Arrange
		var receipts = new List<Receipt>
		{
			new Receipt(
				"Older Store",
				new DateTime(2025, 1, 10),
				10m,
				"https://example.com/1.jpg",
				"img_1",
				"GBP",
				"Groceries"),

			new Receipt(
				"Newer Store",
				new DateTime(2025, 1, 12),
				20m,
				"https://example.com/2.jpg",
				"img_2",
				"GBP",
				"Transport")
		};

		_receiptRepositoryMock
			.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(receipts);

		// Act
		var result = await _resources.GetAllReceiptsAsync();

		// Assert
		var json = JsonDocument.Parse(result.Text);
		var items = json.RootElement.EnumerateArray().ToList();

		Assert.Equal(2, items.Count);
		Assert.Equal("Newer Store", items[0].GetProperty("merchantName").GetString());
		Assert.Equal("Older Store", items[1].GetProperty("merchantName").GetString());
	}

	[Fact]
	public async Task GetReceiptsByDateRangeAsync_Should_Throw_When_From_Date_Is_Invalid()
	{
		// Act
		var action = async () => await _resources.GetReceiptsByDateRangeAsync("bad-date", "2025-01-31");

		// Assert
		var exception = await Assert.ThrowsAsync<McpException>(action);
		Assert.Equal("Invalid 'from' date format. Use YYYY-MM-DD.", exception.Message);
	}

	[Fact]
	public async Task GetReceiptsByDateRangeAsync_Should_Throw_When_To_Date_Is_Invalid()
	{
		// Act
		var action = async () => await _resources.GetReceiptsByDateRangeAsync("2025-01-01", "bad-date");

		// Assert
		var exception = await Assert.ThrowsAsync<McpException>(action);
		Assert.Equal("Invalid 'to' date format. Use YYYY-MM-DD.", exception.Message);
	}
}
