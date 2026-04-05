using Microsoft.AspNetCore.Mvc;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Domain.Entities;

namespace ReceiptAI.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReceiptsController(IReceiptRepository receiptRepository, IImageService imageService) : ControllerBase
{
	private readonly IReceiptRepository _receiptRepository = receiptRepository;
	private readonly IImageService _imageService = imageService;

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
	public async Task<ActionResult<Guid>> Create(
		[FromBody] CreateReceiptRequest request,
		CancellationToken cancellationToken)
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
}
