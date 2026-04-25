using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;

namespace ReceiptAI.IntegrationTests;

public class FakeFailingImageService : IImageService
{
	public Task<ImageUploadResultDto> AddImageAsync(Stream stream, string fileName, CancellationToken cancellationToken = default)
	{

		return Task.FromResult(new ImageUploadResultDto(
			PublicId: null,
			Url: null,
			Error: "Image upload failed."
		));
	}
	public Task<bool> DeleteImageAsync(string publicId, CancellationToken ct)
	{
		throw new NotImplementedException();
	}
}
