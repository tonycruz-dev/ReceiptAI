using Moq;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Domain.Entities;
using ReceiptAI.Infrastructure.Mcp.Tools;
namespace ReceiptAI.UnitTests;

public class McpReceiptToolTests
{
	private readonly Mock<IReceiptRepository> _receiptRepositoryMock;
	private readonly Mock<IReceiptExtractionService> _receiptExtractionServiceMock;
	private readonly McpReceiptTool _tool;

	public McpReceiptToolTests()
	{
		_receiptRepositoryMock = new Mock<IReceiptRepository>();
		_receiptExtractionServiceMock = new Mock<IReceiptExtractionService>();

		_tool = new McpReceiptTool(
			_receiptRepositoryMock.Object,
			_receiptExtractionServiceMock.Object);
	}

	[Fact]
	public async Task CreateReceiptFromImageAsync_Should_Throw_When_ImageUrl_Is_Empty()
	{
		// Arrange
		var request = new ExtractReceiptRequest
		{
			ImageUrl = ""
		};

		// Act
		var action = async () => await _tool.CreateReceiptFromImageAsync(request);

		// Assert
		var exception = await Assert.ThrowsAsync<ArgumentException>(action);
		Assert.Equal("ImageUrl is required.", exception.Message);
	}

	[Fact]
	public async Task CreateReceiptFromImageAsync_Should_Throw_When_Extraction_Returns_Error()
	{
		// Arrange
		var request = new ExtractReceiptRequest
		{
			ImageUrl = "https://example.com/receipt.jpg"
		};

		_receiptExtractionServiceMock
			.Setup(x => x.ExtractReceiptAsync(request.ImageUrl, It.IsAny<CancellationToken>()))
			.ReturnsAsync(new ReceiptExtractionResultDto
			{
				ErrorMessage = "Extraction failed."
			});

		// Act
		var action = async () => await _tool.CreateReceiptFromImageAsync(request);

		// Assert
		var exception = await Assert.ThrowsAsync<Exception>(action);
		Assert.Equal("Extraction failed.", exception.Message);
	}

	[Fact]
	public async Task CreateReceiptFromImageAsync_Should_Save_Receipt_And_Return_Dto()
	{
		// Arrange
		var request = new ExtractReceiptRequest
		{
			ImageUrl = "https://res.cloudinary.com/demo/image/upload/v12345/receipts/receipt1.jpg"
		};

		_receiptExtractionServiceMock
			.Setup(x => x.ExtractReceiptAsync(request.ImageUrl, It.IsAny<CancellationToken>()))
			.ReturnsAsync(new ReceiptExtractionResultDto
			{
				MerchantName = "Tesco",
				PurchaseDate = new DateTime(2025, 1, 10),
				TotalAmount = 25.50m,
				Currency = "GBP",
				Category = "Groceries"
			});

		Receipt? savedReceipt = null;

		_receiptRepositoryMock
			.Setup(x => x.AddAsync(It.IsAny<Receipt>(), It.IsAny<CancellationToken>()))
			.Callback<Receipt, CancellationToken>((receipt, _) => savedReceipt = receipt)
			.Returns(Task.CompletedTask);

		// Act
		var result = await _tool.CreateReceiptFromImageAsync(request);

		// Assert
		Assert.NotNull(result);
		Assert.Equal("Tesco", result.MerchantName);
		Assert.Equal(25.50m, result.TotalAmount);
		Assert.Equal("GBP", result.Currency);
		Assert.Equal("Groceries", result.Category);
		Assert.Equal(request.ImageUrl, result.ImageUrl);

		Assert.NotNull(savedReceipt);
		Assert.Equal("Tesco", savedReceipt!.MerchantName);
		Assert.Equal("receipts/receipt1", savedReceipt.ImagePublicId);

		_receiptRepositoryMock.Verify(
			x => x.AddAsync(It.IsAny<Receipt>(), It.IsAny<CancellationToken>()),
			Times.Once);
	}

	[Fact]
	public async Task CreateReceiptAsync_Should_Save_Receipt_And_Return_Dto()
	{
		// Arrange
		var request = new CreateReceiptRequest
		{
			MerchantName = "Aldi",
			PurchaseDate = new DateTime(2025, 1, 15),
			TotalAmount = 30.00m,
			Currency = "GBP",
			Category = "Groceries",
			ImageUrl = "https://res.cloudinary.com/demo/image/upload/v12345/receipts/aldi.jpg"
		};

		Receipt? savedReceipt = null;

		_receiptRepositoryMock
			.Setup(x => x.AddAsync(It.IsAny<Receipt>(), It.IsAny<CancellationToken>()))
			.Callback<Receipt, CancellationToken>((receipt, _) => savedReceipt = receipt)
			.Returns(Task.CompletedTask);

		// Act
		var result = await _tool.CreateReceiptAsync(request);

		// Assert
		Assert.NotNull(result);
		Assert.Equal("Aldi", result.MerchantName);
		Assert.Equal(30.00m, result.TotalAmount);
		Assert.Equal("Groceries", result.Category);
		Assert.Equal(request.ImageUrl, result.ImageUrl);

		Assert.NotNull(savedReceipt);
		Assert.Equal("receipts/aldi", savedReceipt!.ImagePublicId);

		_receiptRepositoryMock.Verify(
			x => x.AddAsync(It.IsAny<Receipt>(), It.IsAny<CancellationToken>()),
			Times.Once);
	}

	[Fact]
	public async Task GetAllReceiptsAsync_Should_Return_Mapped_Dtos()
	{
		// Arrange
		var receipts = new List<Receipt>
		{
			new("Tesco",	new DateTime(2025, 1, 10),
				25.50m,
				"https://example.com/receipt1.jpg",
				"img_1",
				"GBP",
				"Groceries"
			),
			
			new("Uber",	 new DateTime(2025, 1, 11), 14.99m,
				"https://example.com/receipt2.jpg",
				"img_2",
				"GBP",
				"Transport")
		};

		_receiptRepositoryMock
			.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
			.ReturnsAsync(receipts);

		// Act
		var result = await _tool.GetAllReceiptsAsync();

		// Assert
		Assert.Equal(2, result.Count);
		Assert.Equal("Tesco", result[0].MerchantName);
		Assert.Equal("Uber", result[1].MerchantName);
	}

	[Fact]
	public async Task GetReceiptByIdAsync_Should_Return_Null_When_Not_Found()
	{
		// Arrange
		var id = Guid.NewGuid();

		_receiptRepositoryMock
			.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
			.ReturnsAsync((Receipt?)null);

		// Act
		var result = await _tool.GetReceiptByIdAsync(id);

		// Assert
		Assert.Null(result);
	}

	[Fact]
	public async Task ExtractReceiptAsync_Should_Throw_When_ImageUrl_Is_Empty()
	{
		// Arrange
		var request = new ExtractReceiptRequest
		{
			ImageUrl = ""
		};

		// Act
		var action = async () => await _tool.ExtractReceiptAsync(request);

		// Assert
		var exception = await Assert.ThrowsAsync<ArgumentException>(action);
		Assert.Equal("ImageUrl is required.", exception.Message);
	}

	[Fact]
	public async Task ExtractReceiptAsync_Should_Return_Result_When_Extraction_Succeeds()
	{
		// Arrange
		var request = new ExtractReceiptRequest
		{
			ImageUrl = "https://example.com/receipt.jpg"
		};

		_receiptExtractionServiceMock
			.Setup(x => x.ExtractReceiptAsync(request.ImageUrl, It.IsAny<CancellationToken>()))
			.ReturnsAsync(new ReceiptExtractionResultDto
			{
				MerchantName = "Tesco",
				PurchaseDate = new DateTime(2025, 1, 10),
				TotalAmount = 25.50m,
				Currency = "GBP",
				Category = "Groceries",
				RawText = "sample text"
			});

		// Act
		var result = await _tool.ExtractReceiptAsync(request);

		// Assert
		Assert.NotNull(result);
		Assert.Equal("Tesco", result.MerchantName);
		Assert.Equal(25.50m, result.TotalAmount);
	}

	[Fact]
	public async Task DeleteReceiptAsync_Should_Throw_When_Receipt_Does_Not_Exist()
	{
		// Arrange
		var id = Guid.NewGuid();

		_receiptRepositoryMock
			.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
			.ReturnsAsync((Receipt?)null);

		// Act
		var action = async () => await _tool.DeleteReceiptAsync(id);

		// Assert
		var exception = await Assert.ThrowsAsync<Exception>(action);
		Assert.Equal($"Receipt with ID {id} was not found.", exception.Message);
	}

	[Fact]
	public async Task DeleteReceiptAsync_Should_Delete_Receipt_And_Return_Success_Message()
	{
		// Arrange
		var receipt = new Receipt(
			"Tesco",
			new DateTime(2025, 1, 10),
			25.50m,
			"https://example.com/receipt.jpg",
			"img_1",
			"GBP",
			"Groceries");

		_receiptRepositoryMock
			.Setup(x => x.GetByIdAsync(receipt.Id, It.IsAny<CancellationToken>()))
			.ReturnsAsync(receipt);

		_receiptRepositoryMock
			.Setup(x => x.DeleteAsync(receipt, It.IsAny<CancellationToken>()))
			.Returns(Task.CompletedTask);

		// Act
		var result = await _tool.DeleteReceiptAsync(receipt.Id);

		// Assert
		Assert.Equal("Receipt deleted successfully.", result);

		_receiptRepositoryMock.Verify(
			x => x.DeleteAsync(receipt, It.IsAny<CancellationToken>()),
			Times.Once);
	}
}
