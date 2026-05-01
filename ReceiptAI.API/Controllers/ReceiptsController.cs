using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReceiptAI.Application.Common.Models;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Domain.Entities;
using ReceiptAI.Infrastructure.Repositories;

namespace ReceiptAI.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReceiptsController(
	IReceiptAppService receiptAppService,
	IImageService imageService,
	IReceiptExtractionService receiptAiService) : ControllerBase
{
	private readonly IReceiptAppService _receiptAppService = receiptAppService;
	private readonly IImageService _imageService = imageService;
	private readonly IReceiptExtractionService _receiptAiService = receiptAiService;

	[HttpPost("upload-image")]
	public async Task<ActionResult<ImageUploadResultDto>> UploadImage(IFormFile file, CancellationToken cancellationToken)
	{
		if (file is null || file.Length == 0)
		{
			return BadRequest("No file was provided.");
		}

		await using var stream = file.OpenReadStream();

		var result = await _imageService.AddImageAsync(
			stream,
			file.FileName,
			cancellationToken);

		if (!string.IsNullOrWhiteSpace(result.Error))
		{
			return BadRequest(result.Error);
		}

		return Ok(result);
	}

	[HttpPost]
	public async Task<ActionResult<Guid>> Create([FromBody] CreateReceiptForApiRequest request, CancellationToken cancellationToken)
	{
		var receiptId = await _receiptAppService.CreateReceiptAsync(request, cancellationToken);

		return CreatedAtAction(nameof(GetById), new { id = receiptId }, receiptId);
	}

	[HttpGet]
	public async Task<ActionResult<PagedResult<Receipt>>> GetReceipts(
	[FromQuery] int pageNumber = 1,
	[FromQuery] int pageSize = 20,
	CancellationToken cancellationToken = default)
	{
		var result = await _receiptAppService.GetPagedAsync(
			new PagedRequest
			{
				PageNumber = pageNumber,
				PageSize = pageSize
			},
			cancellationToken);

		return Ok(result);
	}

	[HttpGet("{id:guid}")]
	public async Task<ActionResult<ResponseReceiptDto>> GetById(Guid id, CancellationToken cancellationToken)
	{
		var receipt = await _receiptAppService.GetByIdAsync(id, cancellationToken);

		if (receipt is null)
		{
			return NotFound();
		}

		return Ok(receipt);
	}

	[HttpPost("extract")]
	public async Task<ActionResult<ReceiptExtractionResultDto>> Extract([FromBody] ExtractReceiptRequest request, CancellationToken cancellationToken)
	{
		if (string.IsNullOrWhiteSpace(request.ImageUrl))
		{
			return BadRequest("ImageUrl is required.");
		}

		var result = await _receiptAiService.ExtractReceiptAsync(
			request.ImageUrl,
			cancellationToken);

		if (!string.IsNullOrWhiteSpace(result.ErrorMessage))
		{
			return BadRequest(result);
		}

		return Ok(result);
	}

	[HttpDelete("{id:guid}")]
	public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
	{
		try
		{
			await _receiptAppService.DeleteAsync(id, cancellationToken);
			return NoContent();
		}
		catch (KeyNotFoundException)
		{
			return NotFound();
		}
	}

	[HttpGet("recent")]
	public async Task<ActionResult<List<ResponseReceiptDto>>> GetRecent(int count, CancellationToken cancellationToken)
	{
		var receipts = await _receiptAppService.GetRecentReceiptsAsync(count, cancellationToken);
		return Ok(receipts);
	}

	[HttpGet("category/{category}")]
	public async Task<ActionResult<List<ResponseReceiptDto>>> GetByCategory(string category, CancellationToken cancellationToken)
	{
		var receipts = await _receiptAppService.GetReceiptsByCategoryAsync(category, cancellationToken);
		return Ok(receipts);
	}

	[HttpGet("summary")]
	public async Task<ActionResult<ReceiptSummaryDto>> GetSummary(CancellationToken cancellationToken)
	{
		var summary = await _receiptAppService.GetReceiptSummaryAsync(cancellationToken);
		return Ok(summary);
	}

	[HttpGet("date-range")]
	public async Task<ActionResult<List<ResponseReceiptDto>>> GetByDateRange(string from, string to, CancellationToken cancellationToken)
	{
		if (!DateTime.TryParse(from, out var fromDate))
			return BadRequest("Invalid 'from' date format. Use YYYY-MM-DD.");

		if (!DateTime.TryParse(to, out var toDate))
			return BadRequest("Invalid 'to' date format. Use YYYY-MM-DD.");

		var receipts = await _receiptAppService.GetReceiptsByDateRangeAsync(fromDate, toDate, cancellationToken);

		return Ok(receipts);
	}

	[HttpGet("by-date/{date}")]
	public async Task<ActionResult<List<ResponseReceiptDto>>> GetReceiptsByDate(string date, CancellationToken cancellationToken)
	{
		if (!DateTime.TryParse(date, out var targetDate))
			return BadRequest("Invalid date format. Use YYYY-MM-DD.");

		var receipts = await _receiptAppService.GetReceiptsByDateAsync(targetDate, cancellationToken);

		return Ok(receipts);
	}

	[HttpGet("this-month")]
	public async Task<ActionResult<List<ResponseReceiptDto>>> GetThisMonthReceipts(CancellationToken cancellationToken)
	{
		var receipts = await _receiptAppService.GetThisMonthReceiptsAsync(DateTime.UtcNow, cancellationToken);
		return Ok(receipts);
	}

	[HttpGet("categories")]
	public async Task<ActionResult<List<string>>> GetCategories(CancellationToken cancellationToken)
	{
		return Ok(await _receiptAppService.GetCategoriesAsync(cancellationToken));
     }
}