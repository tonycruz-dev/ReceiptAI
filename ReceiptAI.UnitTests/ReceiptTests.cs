using ReceiptAI.Domain.Entities;

namespace ReceiptAI.UnitTests;

public class ReceiptTests
{
	[Fact]
	public void Constructor_Should_Create_Receipt_When_Data_Is_Valid()
	{
		// Arrange
		var merchantName = "Tesco";
		var purchaseDate = DateTime.UtcNow.AddDays(-1);
		var totalAmount = 25.50m;
		var imageUrl = "https://example.com/receipt.jpg";
		var imagePublicId = "receipt_123";

		// Act
		var receipt = new Receipt(
			merchantName,
			purchaseDate,
			totalAmount,
			imageUrl,
			imagePublicId);

		// Assert
		Assert.NotEqual(Guid.Empty, receipt.Id);
		Assert.Equal(merchantName, receipt.MerchantName);
		Assert.Equal(purchaseDate, receipt.PurchaseDate);
		Assert.Equal(totalAmount, receipt.TotalAmount);
		Assert.Equal(imageUrl, receipt.ImageUrl);
		Assert.Equal(imagePublicId, receipt.ImagePublicId);
		Assert.Equal("GBP", receipt.Currency);
		Assert.Equal("Other", receipt.Category);
	}

	[Fact]
	public void Constructor_Should_Throw_When_MerchantName_Is_Empty()
	{
		var ex = Assert.Throws<ArgumentException>(() =>
			new Receipt(
				"",
				DateTime.UtcNow.AddDays(-1),
				25.50m,
				"https://example.com/receipt.jpg",
				"receipt_123"));

		Assert.Equal("Merchant name is required", ex.Message);
	}

	[Fact]
	public void Constructor_Should_Throw_When_PurchaseDate_Is_In_Future()
	{
		var ex = Assert.Throws<ArgumentException>(() =>
			new Receipt(
				"Tesco",
				DateTime.UtcNow.AddDays(1),
				25.50m,
				"https://example.com/receipt.jpg",
				"receipt_123"));

		Assert.Equal("Purchase date cannot be in the future", ex.Message);
	}

	[Fact]
	public void Constructor_Should_Throw_When_TotalAmount_Is_Negative()
	{
		var ex = Assert.Throws<ArgumentException>(() =>
			new Receipt(
				"Tesco",
				DateTime.UtcNow.AddDays(-1),
				-1m,
				"https://example.com/receipt.jpg",
				"receipt_123"));

		Assert.Equal("Total amount cannot be negative", ex.Message);
	}

	[Fact]
	public void Constructor_Should_Throw_When_ImageUrl_Is_Empty()
	{
		var ex = Assert.Throws<ArgumentException>(() =>
			new Receipt(
				"Tesco",
				DateTime.UtcNow.AddDays(-1),
				25.50m,
				"",
				"receipt_123"));

		Assert.Equal("Image URL is required", ex.Message);
	}

	[Fact]
	public void Constructor_Should_Throw_When_ImagePublicId_Is_Empty()
	{
		var ex = Assert.Throws<ArgumentException>(() =>
			new Receipt(
				"Tesco",
				DateTime.UtcNow.AddDays(-1),
				25.50m,
				"https://example.com/receipt.jpg",
				""));

		Assert.Equal("Image Public ID is required", ex.Message);
	}

	[Fact]
	public void Constructor_Should_Use_Default_Currency_And_Category()
	{
		// Act
		var receipt = new Receipt(
			"Tesco",
			DateTime.UtcNow.AddDays(-1),
			25.50m,
			"https://example.com/receipt.jpg",
			"receipt_123");

		// Assert
		Assert.Equal("GBP", receipt.Currency);
		Assert.Equal("Other", receipt.Category);
	}

	[Fact]
	public void Constructor_Should_Use_Provided_Currency_And_Category()
	{
		// Act
		var receipt = new Receipt(
			"Tesco",
			DateTime.UtcNow.AddDays(-1),
			25.50m,
			"https://example.com/receipt.jpg",
			"receipt_123",
			"USD",
			"Groceries");

		// Assert
		Assert.Equal("USD", receipt.Currency);
		Assert.Equal("Groceries", receipt.Category);
	}

	[Fact]
	public void Constructor_Should_Throw_When_Currency_Is_Empty()
	{
		var ex = Assert.Throws<ArgumentException>(() =>
			new Receipt(
				"Tesco",
				DateTime.UtcNow.AddDays(-1),
				25.50m,
				"https://example.com/receipt.jpg",
				"receipt_123",
				""));

		Assert.Equal("Currency is required", ex.Message);
	}

	[Fact]
	public void Constructor_Should_Throw_When_Category_Is_Empty()
	{
		var ex = Assert.Throws<ArgumentException>(() =>
			new Receipt(
				"Tesco",
				DateTime.UtcNow.AddDays(-1),
				25.50m,
				"https://example.com/receipt.jpg",
				"receipt_123",
				"GBP",
				""));

		Assert.Equal("Category is required", ex.Message);
	}
}