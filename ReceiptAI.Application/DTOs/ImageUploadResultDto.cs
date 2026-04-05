namespace ReceiptAI.Application.DTOs;

public sealed record ImageUploadResultDto(
	string? PublicId,
	string? Url,
	string? Error
);