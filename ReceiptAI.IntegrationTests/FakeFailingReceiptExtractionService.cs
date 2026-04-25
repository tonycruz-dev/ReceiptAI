using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;

namespace ReceiptAI.IntegrationTests;

public class FakeFailingReceiptExtractionService : IReceiptExtractionService
{
	public Task<ReceiptExtractionResultDto> ExtractReceiptAsync(string imageUrl, CancellationToken cancellationToken = default)
	{
		return Task.FromResult(new ReceiptExtractionResultDto
		{
			ErrorMessage = "Extraction failed."
		});
	}
}