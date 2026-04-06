using ReceiptAI.Application.DTOs;

namespace ReceiptAI.Application.Interfaces;

public interface IReceiptAiService
{
	Task<ReceiptExtractionResultDto> ExtractReceiptAsync(
		string imageUrl,
		CancellationToken cancellationToken = default);
}