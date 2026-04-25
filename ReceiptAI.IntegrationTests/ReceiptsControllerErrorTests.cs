using ReceiptAI.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Text;

namespace ReceiptAI.IntegrationTests;

public class ReceiptsControllerErrorTests : IClassFixture<ErrorCustomWebApplicationFactory>
{
	private readonly HttpClient _client;

	public ReceiptsControllerErrorTests(ErrorCustomWebApplicationFactory factory)
	{
		_client = factory.CreateClient();
	}

	[Fact]
	public async Task UploadImage_Should_Return_BadRequest_When_ImageService_Returns_Error()
	{
		// Arrange
		using var content = new MultipartFormDataContent();
		using var fileContent = new ByteArrayContent(new byte[] { 1, 2, 3, 4 });

		fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
		content.Add(fileContent, "file", "receipt.jpg");

		// Act
		var response = await _client.PostAsync("/api/receipts/upload-image", content);

		// Assert
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
	}

	[Fact]
	public async Task Extract_Should_Return_BadRequest_When_ExtractionService_Returns_Error()
	{
		// Arrange
		var request = new ExtractReceiptRequest
		{
			ImageUrl = "https://example.com/receipt.jpg"
		};

		// Act
		var response = await _client.PostAsJsonAsync("/api/receipts/extract", request);

		// Assert
		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

		var result = await response.Content.ReadFromJsonAsync<ReceiptExtractionResultDto>();

		Assert.NotNull(result);
		Assert.Equal("Extraction failed.", result!.ErrorMessage);
	}
}
