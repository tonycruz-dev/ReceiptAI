using ReceiptAI.Application.DTOs;

namespace ReceiptAI.Application.Interfaces;

public interface IReceiptExtractionService
{
	Task<ReceiptExtractionResultDto> ExtractReceiptAsync(
		string imageUrl,
		CancellationToken cancellationToken = default);
}