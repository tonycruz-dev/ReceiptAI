namespace ReceiptAI.Application.DTOs;

public sealed class ReceiptExtractionResultDto
{
	public string? MerchantName { get; set; }
	public DateTime? PurchaseDate { get; set; }
	public decimal? TotalAmount { get; set; }
	public string? Currency { get; set; }
	public string? Category { get; set; }
	public string? RawText { get; set; }
	public string? ErrorMessage { get; set; }
}