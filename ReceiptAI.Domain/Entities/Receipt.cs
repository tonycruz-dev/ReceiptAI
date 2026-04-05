namespace ReceiptAI.Domain.Entities;

public class Receipt
{
	public Guid Id { get; set; }
	public string MerchantName { get; set; } = string.Empty;
	public DateTime PurchaseDate { get; set; }
	public decimal TotalAmount { get; set; }
	public string Currency { get; set; } = "GBP";
	public string Category { get; set; } = "Other";
	public string ImageUrl { get; set; } = string.Empty;
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	public string ImagePublicId { get; set; } = string.Empty;
}
