using Microsoft.AspNetCore.Mvc;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Domain.Entities;

namespace ReceiptAI.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReceiptsController(
IReceiptRepository receiptRepository,
IImageService imageService,
IReceiptAiService receiptAiService) : ControllerBase
{
	private readonly IReceiptRepository _receiptRepository = receiptRepository;
	private readonly IImageService _imageService = imageService;
	private readonly IReceiptAiService _receiptAiService = receiptAiService;

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
		var receipt = new Receipt
		{
			Id = Guid.NewGuid(),
			MerchantName = request.MerchantName,
			PurchaseDate = request.PurchaseDate,
			TotalAmount = request.TotalAmount,
			Currency = request.Currency,
			Category = request.Category,
			ImageUrl = request.ImageUrl,
			ImagePublicId = request.ImagePublicId,
			CreatedAt = DateTime.UtcNow
		};

		await _receiptRepository.AddAsync(receipt, cancellationToken);

		return CreatedAtAction(nameof(GetById), new { id = receipt.Id }, receipt.Id);
	}

	[HttpGet]
	public async Task<ActionResult<List<ReceiptDto>>> GetAll(CancellationToken cancellationToken)
	{
		var receipts = await _receiptRepository.GetAllAsync(cancellationToken);

		var result = receipts.Select(r => new ReceiptDto
		{
			Id = r.Id,
			MerchantName = r.MerchantName,
			PurchaseDate = r.PurchaseDate,
			TotalAmount = r.TotalAmount,
			Currency = r.Currency,
			Category = r.Category,
			ImageUrl = r.ImageUrl,
			ImagePublicId = r.ImagePublicId,
			CreatedAt = r.CreatedAt
		}).ToList();

		return Ok(result);
	}

	[HttpGet("{id:guid}")]
	public async Task<ActionResult<ReceiptDto>> GetById(Guid id, CancellationToken cancellationToken)
	{
		var receipt = await _receiptRepository.GetByIdAsync(id, cancellationToken);

		if (receipt is null)
		{
			return NotFound();
		}

		var result = new ReceiptDto
		{
			Id = receipt.Id,
			MerchantName = receipt.MerchantName,
			PurchaseDate = receipt.PurchaseDate,
			TotalAmount = receipt.TotalAmount,
			Currency = receipt.Currency,
			Category = receipt.Category,
			ImageUrl = receipt.ImageUrl,
			ImagePublicId = receipt.ImagePublicId,
			CreatedAt = receipt.CreatedAt
		};

		return Ok(result);
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
		var receipt = await _receiptRepository.GetByIdAsync(id, cancellationToken);

		if (receipt is null)
		{
			return NotFound();
		}

		if (!string.IsNullOrWhiteSpace(receipt.ImagePublicId))
		{
			var imageDeleted = await _imageService.DeleteImageAsync(
				receipt.ImagePublicId,
				cancellationToken);

			if (!imageDeleted)
			{
				return BadRequest("Failed to delete receipt image from storage.");
			}
		}

		await _receiptRepository.DeleteAsync(receipt, cancellationToken);

		return NoContent();
	}

	[HttpGet("recent")]
	public async Task<ActionResult<List<ResponseReceiptDto>>> GetRecent(int count, CancellationToken cancellationToken)
	{
		var receipts = await _receiptRepository.GetRecentReceiptsAsync(count, cancellationToken);

		var result = receipts.Select(r => new ResponseReceiptDto
		{
			Id = r.Id,
			MerchantName = r.MerchantName,
			PurchaseDate = r.PurchaseDate.ToString("yyyy-MM-dd"),
			TotalAmount = r.TotalAmount,
			Currency = r.Currency,
			Category = r.Category,
			ImageUrl = r.ImageUrl,
		}).ToList();

		return Ok(result);
	}
	[HttpGet("category/{category}")]
	public async Task<ActionResult<List<ResponseReceiptDto>>> GetByCategory(string category, CancellationToken cancellationToken)
	{
		var receipts = await _receiptRepository.GetReceiptsByCategoryAsync(category, cancellationToken);

		var result = receipts.Select(r => new ResponseReceiptDto
		{
			Id = r.Id,
			MerchantName = r.MerchantName,
			PurchaseDate = r.PurchaseDate.ToString("yyyy-MM-dd"),
			TotalAmount = r.TotalAmount,
			Currency = r.Currency,
			Category = r.Category,
			ImageUrl = r.ImageUrl,
		}).ToList();

		return Ok(result);
	}
	[HttpGet("summary")]
	public async Task<ActionResult<ReceiptSummaryDto>> GetSummary(CancellationToken cancellationToken)
	{
		var summary = await _receiptRepository.GetReceiptSummaryAsync(cancellationToken);

		return Ok(summary);
	}

	//get receipts by date range
	[HttpGet("date-range")]
	public async Task<ActionResult<List<ResponseReceiptDto>>> GetByDateRange(string from, string to, CancellationToken cancellationToken)
	{
		if (!DateTime.TryParse(from, out var fromDate))
			return BadRequest("Invalid 'from' date format. Use YYYY-MM-DD.");

		if (!DateTime.TryParse(to, out var toDate))
			return BadRequest("Invalid 'to' date format. Use YYYY-MM-DD.");

		var receipts = await _receiptRepository.GetReceiptsByDateRangeAsync(fromDate, toDate, cancellationToken);

		var result = receipts.Select(r => new ResponseReceiptDto
		{
			Id = r.Id,
			MerchantName = r.MerchantName,
			PurchaseDate = r.PurchaseDate.ToString("yyyy-MM-dd"),
			TotalAmount = r.TotalAmount,
			Currency = r.Currency,
			Category = r.Category,
			ImageUrl = r.ImageUrl,
		}).ToList();

		return Ok(result);
	}
	//GetReceiptsByDate
	[HttpGet("receiptbydate:{date}")]
	public async Task<ActionResult<List<ResponseReceiptDto>>> GetReceiptsByDate(string date, CancellationToken cancellationToken)
	{
		if (!DateTime.TryParse(date, out var targetDate))
			return BadRequest("Invalid date format. Use YYYY-MM-DD.");

		var receipts = await _receiptRepository.GetReceiptsByDateAsync(targetDate, cancellationToken);

		var result = receipts.Select(r => new ResponseReceiptDto
		{
			Id = r.Id,
			MerchantName = r.MerchantName,
			PurchaseDate = r.PurchaseDate.ToString("yyyy-MM-dd"),
			TotalAmount = r.TotalAmount,
			Currency = r.Currency,
			Category = r.Category,
			ImageUrl = r.ImageUrl,
		}).ToList();

		return Ok(result);
	}
	//GetThisMonthReceipts
	[HttpGet("this-month")]
	public async Task<ActionResult<List<ResponseReceiptDto>>> GetThisMonthReceipts(CancellationToken cancellationToken)
	{
		var now = DateTime.UtcNow;
		var firstDayOfMonth = new DateTime(now.Year, now.Month, 1);
		var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);
		var receipts = await _receiptRepository.GetReceiptsByDateRangeAsync(firstDayOfMonth, lastDayOfMonth, cancellationToken);
		var result = receipts.Select(r => new ResponseReceiptDto
		{
			Id = r.Id,
			MerchantName = r.MerchantName,
			PurchaseDate = r.PurchaseDate.ToString("yyyy-MM-dd"),
			TotalAmount = r.TotalAmount,
			Currency = r.Currency,
			Category = r.Category,
			ImageUrl = r.ImageUrl,
		}).ToList();
		return Ok(result);
	}
}