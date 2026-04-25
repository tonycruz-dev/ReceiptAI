using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;

namespace ReceiptAI.IntegrationTests;

public class FakeImageService : IImageService
{
	public Task<ImageUploadResultDto> AddImageAsync(Stream stream, string fileName, CancellationToken cancellationToken = default)
	{
		return Task.FromResult(new ImageUploadResultDto(
			PublicId: "fake_public_id",
			Url: "https://fake.test/uploaded-image.jpg",
			Error: null
		));
	}

	public Task<bool> DeleteImageAsync(string publicId, CancellationToken ct)
	{
		throw new NotImplementedException();
	}
}
