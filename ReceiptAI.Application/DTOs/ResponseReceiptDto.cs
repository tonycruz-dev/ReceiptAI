namespace ReceiptAI.Application.DTOs;

public class ResponseReceiptDto
{
	public Guid Id { get; set; }
	public string MerchantName { get; set; } = string.Empty;
	public string PurchaseDate { get; set; } = string.Empty;
	public decimal TotalAmount { get; set; }
	public string Currency { get; set; } = string.Empty;
	public string Category { get; set; } = string.Empty;
	public string ImageUrl { get; set; } = string.Empty;
}
