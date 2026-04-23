namespace ReceiptAI.Application.DTOs;

public sealed class CurrencySummaryDto
{
	public string Currency { get; set; } = string.Empty;
	public decimal TotalAmount { get; set; }
	public int Count { get; set; }
}
