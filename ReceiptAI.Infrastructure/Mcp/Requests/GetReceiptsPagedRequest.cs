namespace ReceiptAI.Infrastructure.Mcp.Requests;

public sealed class GetReceiptsPagedRequest
{
	public int PageNumber { get; set; } = 1;
	public int PageSize { get; set; } = 20;
}
