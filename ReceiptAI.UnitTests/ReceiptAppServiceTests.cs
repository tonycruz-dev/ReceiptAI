using Moq;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Application.Services;
using ReceiptAI.Domain.Entities;

namespace ReceiptAI.UnitTests;

public class ReceiptAppServiceTests
{
	private readonly Mock<IReceiptRepository> _receiptRepositoryMock;
	private readonly ReceiptAppService _service;

	public ReceiptAppServiceTests()
	{
		_receiptRepositoryMock = new Mock<IReceiptRepository>();
		_service = new ReceiptAppService(_receiptRepositoryMock.Object);
	}

	[Fact]
	public async Task CreateReceiptAsync_Should_Add_Receipt_And_Return_Id()
	{
		// Arrange
		var request = new CreateReceiptForApiRequest
		{
			MerchantName = "Tesco",
			PurchaseDate = DateTime.UtcNow.AddDays(-1),
			TotalAmount = 25.50m,
			ImageUrl = "https://example.com/receipt.jpg",
			ImagePublicId = "receipt_123",
			Currency = "GBP",
			Category = "Groceries"
		};

		Receipt? savedReceipt = null;

		_receiptRepositoryMock
			.Setup(r => r.AddAsync(It.IsAny<Receipt>(), It.IsAny<CancellationToken>()))
			.Callback<Receipt, CancellationToken>((receipt, _) => savedReceipt = receipt)
			.Returns(Task.CompletedTask);

		// Act
		var id = await _service.CreateReceiptAsync(request, CancellationToken.None);

		// Assert
		Assert.NotEqual(Guid.Empty, id);
		Assert.NotNull(savedReceipt);
		Assert.Equal(request.MerchantName, savedReceipt!.MerchantName);
		Assert.Equal(request.TotalAmount, savedReceipt.TotalAmount);
		Assert.Equal(request.ImageUrl, savedReceipt.ImageUrl);
		Assert.Equal(request.ImagePublicId, savedReceipt.ImagePublicId);

		_receiptRepositoryMock.Verify(
			r => r.AddAsync(It.IsAny<Receipt>(), It.IsAny<CancellationToken>()),
			Times.Once);
	}

	[Fact]
	public async Task GetByIdAsync_Should_Return_Null_When_Receipt_Does_Not_Exist()
	{
		// Arrange
		_receiptRepositoryMock
			.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((Receipt?)null);

		// Act
		var result = await _service.GetByIdAsync(Guid.NewGuid(), CancellationToken.None);

		// Assert
		Assert.Null(result);
	}

	[Fact]
	public async Task GetByIdAsync_Should_Return_Mapped_ResponseReceiptDto_When_Receipt_Exists()
	{
		// Arrange
		var receipt = new Receipt(
			"Tesco",
			new DateTime(2025, 1, 10),
			25.50m,
			"https://example.com/receipt.jpg",
			"receipt_123",
			"GBP",
			"Groceries");

		_receiptRepositoryMock
			.Setup(r => r.GetByIdAsync(receipt.Id, It.IsAny<CancellationToken>()))
			.ReturnsAsync(receipt);

		// Act
		var result = await _service.GetByIdAsync(receipt.Id, CancellationToken.None);

		// Assert
		Assert.NotNull(result);
		Assert.Equal(receipt.Id, result!.Id);
		Assert.Equal("Tesco", result.MerchantName);
		Assert.Equal("2025-01-10", result.PurchaseDate);
		Assert.Equal(25.50m, result.TotalAmount);
		Assert.Equal("GBP", result.Currency);
		Assert.Equal("Groceries", result.Category);
		Assert.Equal("https://example.com/receipt.jpg", result.ImageUrl);
	}

	[Fact]
	public async Task GetAllAsync_Should_Return_Mapped_List_Of_ResponseReceiptDto()
	{
		// Arrange
		var receipts = new List<Receipt>
		{
			new Receipt(
				"Tesco",
				new DateTime(2025, 1, 10),
				25.50m,
				"https://example.com/receipt1.jpg",
				"receipt_1",
				"GBP",
				"Groceries"),

			new Receipt(
				"Uber",
				new DateTime(2025, 1, 11),
				14.99m,
				"https://example.com/receipt2.jpg",
				"receipt_2",
				"GBP",
				"Transport")
		};

		_receiptRepositoryMock
			.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(receipts);

		// Act
		var result = await _service.GetAllAsync(CancellationToken.None);

		// Assert
		Assert.Equal(2, result.Count);

		Assert.Equal("Tesco", result[0].MerchantName);
		Assert.Equal("2025-01-10", result[0].PurchaseDate);
		Assert.Equal(25.50m, result[0].TotalAmount);

		Assert.Equal("Uber", result[1].MerchantName);
		Assert.Equal("2025-01-11", result[1].PurchaseDate);
		Assert.Equal(14.99m, result[1].TotalAmount);
	}

	[Fact]
	public async Task DeleteAsync_Should_Delete_Receipt_When_It_Exists()
	{
		// Arrange
		var receipt = new Receipt(
			"Tesco",
			DateTime.UtcNow.AddDays(-1),
			25.50m,
			"https://example.com/receipt.jpg",
			"receipt_123");

		_receiptRepositoryMock
			.Setup(r => r.GetByIdAsync(receipt.Id, It.IsAny<CancellationToken>()))
			.ReturnsAsync(receipt);

		_receiptRepositoryMock
			.Setup(r => r.DeleteAsync(receipt, It.IsAny<CancellationToken>()))
			.Returns(Task.CompletedTask);

		// Act
		await _service.DeleteAsync(receipt.Id, CancellationToken.None);

		// Assert
		_receiptRepositoryMock.Verify(
			r => r.DeleteAsync(receipt, It.IsAny<CancellationToken>()),
			Times.Once);
	}

	[Fact]
	public async Task DeleteAsync_Should_Throw_When_Receipt_Does_Not_Exist()
	{
		// Arrange
		_receiptRepositoryMock
			.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((Receipt?)null);

		// Act
		var action = async () => await _service.DeleteAsync(Guid.NewGuid(), CancellationToken.None);

		// Assert
		var exception = await Assert.ThrowsAsync<KeyNotFoundException>(action);
		Assert.Equal("Receipt not found.", exception.Message);
	}

	[Fact]
	public async Task GetReceiptsByCategoryAsync_Should_Return_Mapped_Results()
	{
		// Arrange
		var receipts = new List<Receipt>
		{
			new Receipt(
				"Tesco",
				new DateTime(2025, 1, 10),
				25.50m,
				"https://example.com/receipt1.jpg",
				"receipt_1",
				"GBP",
				"Groceries")
		};

		_receiptRepositoryMock
			.Setup(r => r.GetReceiptsByCategoryAsync("Groceries", It.IsAny<CancellationToken>()))
			.ReturnsAsync(receipts);

		// Act
		var result = await _service.GetReceiptsByCategoryAsync("Groceries", CancellationToken.None);

		// Assert
		Assert.Single(result);
		Assert.Equal("Tesco", result[0].MerchantName);
		Assert.Equal("Groceries", result[0].Category);
	}
}
