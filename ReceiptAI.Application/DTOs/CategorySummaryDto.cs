namespace ReceiptAI.Application.DTOs;

public sealed class CategorySummaryDto
{
	public string Category { get; set; } = string.Empty;
	public int Count { get; set; }
	public decimal TotalAmount { get; set; }
}