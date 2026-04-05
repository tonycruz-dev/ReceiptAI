using ReceiptAI.Application.DTOs;

namespace ReceiptAI.Application.Interfaces;

public interface IImageService
{
	Task<ImageUploadResultDto> AddImageAsync(Stream fileStream, string fileName, CancellationToken ct);
	Task<bool> DeleteImageAsync(string publicId, CancellationToken ct);
}