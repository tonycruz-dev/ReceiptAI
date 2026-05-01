using ModelContextProtocol;
using ModelContextProtocol.Protocol;
using ModelContextProtocol.Server;
using ReceiptAI.Application.Common.Models;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;
using System.ComponentModel;
using System.Text.Json;

namespace ReceiptAI.Infrastructure.Mcp.Resources;

[McpServerResourceType]
public sealed class McpReceiptResources(IReceiptRepository receiptRepository)
{
	private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
	{
		WriteIndented = true
	};

	[McpServerResource(UriTemplate = "receipt://all", Name = "All Receipts", MimeType = "application/json")]
	public async Task<TextResourceContents> GetAllReceiptsAsync(CancellationToken ct = default)
	{
		var receipts = await receiptRepository.GetAllAsync(ct);

		var result = receipts
			.Select(ToViewDto)
			.OrderByDescending(r => r.PurchaseDate)
			.ToList();

		return CreateResponse("receipt://all", result);
	}

	[McpServerResource(UriTemplate = "receipt://by-id/{id}", Name = "Receipt By Id", MimeType = "application/json")]
	public async Task<TextResourceContents> GetReceiptByIdAsync(Guid id, CancellationToken ct = default)
	{
		var receipt = await receiptRepository.GetByIdAsync(id, ct)
			?? throw new McpException($"Receipt not found: {id}");

		var result = ToViewDto(receipt);

		return CreateResponse($"receipt://by-id/{id}", result);
	}

	[McpServerResource(UriTemplate = "receipt://recent/{count}", Name = "Recent Receipts", MimeType = "application/json")]
	public async Task<TextResourceContents> GetRecentReceiptsAsync(int count, CancellationToken ct = default)
	{
		if (count <= 0)
			throw new McpException("Count must be greater than 0.");

		var receipts = await receiptRepository.GetRecentReceiptsAsync(count, ct);

		var result = receipts
			.Select(ToViewDto)
			.OrderByDescending(r => r.PurchaseDate)
			.ToList();

		return CreateResponse($"receipt://recent/{count}", result);
	}

	[McpServerResource(UriTemplate = "receipt://recent", Name = "Recent Receipts (Top 10)", MimeType = "application/json")]
	public Task<TextResourceContents> GetRecentDefaultAsync(CancellationToken ct = default)
		=> GetRecentReceiptsAsync(10, ct);

	[McpServerResource(UriTemplate = "receipt://category/{category}", Name = "Receipts By Category", MimeType = "application/json")]
	public async Task<TextResourceContents> GetReceiptsByCategoryAsync(string category, CancellationToken ct = default)
	{
		if (string.IsNullOrWhiteSpace(category))
			throw new McpException("Category is required.");

		var receipts = await receiptRepository.GetReceiptsByCategoryAsync(category, ct);

		var result = receipts
			.Select(ToViewDto)
			.Where(r => string.Equals(r.Category, category, StringComparison.OrdinalIgnoreCase))
			.OrderByDescending(r => r.PurchaseDate)
			.ToList();

		return CreateResponse($"receipt://category/{category}", result);
	}

	[McpServerResource(UriTemplate = "receipt://summary", Name = "Receipt Summary", MimeType = "application/json")]
	public async Task<TextResourceContents> GetReceiptSummaryAsync(CancellationToken ct = default)
	{
		var summary = await receiptRepository.GetReceiptSummaryAsync(ct);

		return CreateResponse("receipt://summary", summary);
	}

	[McpServerResource(
		UriTemplate = "receipt://date/{from}/{to}",
		Name = "Receipts By Date Range",
		MimeType = "application/json")]
	[Description("Returns receipts between two dates (inclusive). Format: YYYY-MM-DD")]
	public async Task<TextResourceContents> GetReceiptsByDateRangeAsync(
		string from,
		string to,
		CancellationToken ct = default)
	{
		if (!DateTime.TryParse(from, out var fromDate))
			throw new McpException("Invalid 'from' date format. Use YYYY-MM-DD.");

		if (!DateTime.TryParse(to, out var toDate))
			throw new McpException("Invalid 'to' date format. Use YYYY-MM-DD.");

		var receipts = await receiptRepository.GetReceiptsByDateRangeAsync(fromDate, toDate, ct);

		var result = receipts
			.Select(ToViewDto)
			.OrderByDescending(r => r.PurchaseDate)
			.ToList();

		return CreateResponse($"receipt://date/{from}/{to}", result);
	}

	[McpServerResource(
		UriTemplate = "receipt://date/{date}",
		Name = "Receipts By Date",
		MimeType = "application/json")]
	public async Task<TextResourceContents> GetReceiptsByDateAsync(string date, CancellationToken ct = default)
	{
		if (!DateTime.TryParse(date, out var targetDate))
			throw new McpException("Invalid date format. Use YYYY-MM-DD.");

		var receipts = await receiptRepository.GetReceiptsByDateAsync(targetDate, ct);

		var result = receipts
			.Where(r => r.PurchaseDate.Date == targetDate.Date)
			.Select(ToViewDto)
			.OrderByDescending(r => r.PurchaseDate)
			.ToList();

		return CreateResponse($"receipt://date/{date}", result);
	}

	[McpServerResource(UriTemplate = "receipt://this-month",Name = "Receipts This Month", MimeType = "application/json")]
	public Task<TextResourceContents> GetThisMonthReceiptsAsync(CancellationToken ct = default)
	{
		var now = DateTime.UtcNow;
		var from = new DateTime(now.Year, now.Month, 1);
		var to = from.AddMonths(1).AddDays(-1);

		return GetReceiptsByDateRangeAsync(
			from.ToString("yyyy-MM-dd"),
			to.ToString("yyyy-MM-dd"),
			ct);
	}

	[McpServerResource(
	UriTemplate = "receipt://page/{pageNumber}/{pageSize}",
	Name = "Receipts Page",
	MimeType = "application/json")]
	[Description("Returns a paginated list of receipts. Format: receipt://page/{pageNumber}/{pageSize}")]
	public async Task<TextResourceContents> GetReceiptsPageAsync(
	int pageNumber,
	int pageSize,
	CancellationToken ct = default)
	{
		if (pageNumber <= 0)
			throw new McpException("Page number must be greater than 0.");

		if (pageSize <= 0)
			throw new McpException("Page size must be greater than 0.");

		if (pageSize > 100)
			pageSize = 100;

		var pagedReceipts = await receiptRepository.GetPagedAsync(
			new PagedRequest
			{
				PageNumber = pageNumber,
				PageSize = pageSize
			},
			ct);

		var result = new PagedResult<ReceiptViewDto>
		{
			Items = pagedReceipts.Items
				.Select(ToViewDto)
				.ToList(),

			PageNumber = pagedReceipts.PageNumber,
			PageSize = pagedReceipts.PageSize,
			TotalCount = pagedReceipts.TotalCount
		};

		return CreateResponse($"receipt://page/{pageNumber}/{pageSize}", result);
	}

	private static ReceiptViewDto ToViewDto(Domain.Entities.Receipt r) => new()
	{
		Id = r.Id,
		MerchantName = r.MerchantName,
		PurchaseDate = r.PurchaseDate,
		TotalAmount = r.TotalAmount,
		Currency = r.Currency,
		Category = r.Category,
		ImageUrl = r.ImageUrl
	};

	private static TextResourceContents CreateResponse(string uri, object data)
	{
		return new TextResourceContents
		{
			Uri = uri,
			MimeType = "application/json",
			Text = JsonSerializer.Serialize(data, JsonOptions)
		};
	}
}