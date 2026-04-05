namespace ReceiptAI.Application.DTOs;

public class CreateReceiptRequest
{
	public string MerchantName { get; set; } = string.Empty;
	public DateTime PurchaseDate { get; set; }
	public decimal TotalAmount { get; set; }
	public string Currency { get; set; } = "GBP";
	public string Category { get; set; } = "Other";
	public string ImageUrl { get; set; } = string.Empty;
}
