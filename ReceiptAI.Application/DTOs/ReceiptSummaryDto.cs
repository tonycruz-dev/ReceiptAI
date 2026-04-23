namespace ReceiptAI.Application.DTOs;

public sealed class ReceiptSummaryDto
{
	public int TotalReceipts { get; set; }
	public decimal TotalAmount { get; set; }
	public List<CurrencySummaryDto> Currencies { get; set; } = [];
	public List<CategorySummaryDto> Categories { get; set; } = [];
}
