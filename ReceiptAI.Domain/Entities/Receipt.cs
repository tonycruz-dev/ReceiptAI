using System.Diagnostics.CodeAnalysis;

namespace ReceiptAI.Domain.Entities;

public class Receipt
{
	public Guid Id { get; set; }
	public required string MerchantName { get; set; }
	public required DateTime PurchaseDate { get; set; }
	public required decimal TotalAmount { get; set; }
	public required string Currency { get; set; }
	public required string Category { get; set; }
	public required string ImageUrl { get; set; }
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	public required string ImagePublicId { get; set; }

	public Receipt() { }

	[SetsRequiredMembers]
	public Receipt(string merchantName,	DateTime purchaseDate,	decimal totalAmount,
	string imageUrl, string imagePublicId,
	string currency = "GBP", string category = "Other")
	{
		if (string.IsNullOrWhiteSpace(merchantName))
			throw new ArgumentException("Merchant name is required");

		if (purchaseDate > DateTime.UtcNow)
			throw new ArgumentException("Purchase date cannot be in the future");

		if (totalAmount < 0)
			throw new ArgumentException("Total amount cannot be negative");

		if (string.IsNullOrWhiteSpace(imageUrl))
			throw new ArgumentException("Image URL is required");

		if (string.IsNullOrWhiteSpace(currency))
			throw new ArgumentException("Currency is required");

		if (string.IsNullOrWhiteSpace(category))
			throw new ArgumentException("Category is required");

		if (string.IsNullOrWhiteSpace(imagePublicId))
			throw new ArgumentException("Image Public ID is required");

		Id = Guid.NewGuid();
		MerchantName = merchantName;
		PurchaseDate = purchaseDate;
		TotalAmount = totalAmount;
		ImageUrl = imageUrl;
		Currency = currency;
		Category = category;
		ImagePublicId = imagePublicId;
		CreatedAt = DateTime.UtcNow;
	}
	
}