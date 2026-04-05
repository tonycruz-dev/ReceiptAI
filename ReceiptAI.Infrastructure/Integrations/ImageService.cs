using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;


namespace ReceiptAI.Infrastructure.Integrations;

public sealed class ImageService : IImageService
{
	private const string ReceiptFolder = "receipts";
	private readonly Cloudinary _cloudinary;

	public ImageService(IOptions<CloudinarySettings> config)
	{
		var settings = config.Value;

		var account = new Account(
			settings.CloudName,
			settings.ApiKey,
			settings.ApiSecret
		);

		_cloudinary = new Cloudinary(account);
	}

	public async Task<ImageUploadResultDto> AddImageAsync(
		Stream fileStream,
		string fileName,
		CancellationToken ct)
	{
		if (fileStream is null)
			throw new ArgumentNullException(nameof(fileStream));

		if (string.IsNullOrWhiteSpace(fileName))
			throw new ArgumentException("File name is required.", nameof(fileName));

		var uploadParams = new ImageUploadParams
		{
			File = new FileDescription(fileName, fileStream),
			Folder = ReceiptFolder
		};

		var uploadResult = await _cloudinary.UploadAsync(uploadParams);

		return new ImageUploadResultDto(
			uploadResult.PublicId,
			uploadResult.SecureUrl?.AbsoluteUri,
			uploadResult.Error?.Message
		);
	}

	public async Task<bool> DeleteImageAsync(string publicId, CancellationToken ct)
	{
		if (string.IsNullOrWhiteSpace(publicId))
			return false;

		var deleteParams = new DeletionParams(publicId);
		var result = await _cloudinary.DestroyAsync(deleteParams);

		return result.Error is null &&
			   string.Equals(result.Result, "ok", StringComparison.OrdinalIgnoreCase);
	}
}
