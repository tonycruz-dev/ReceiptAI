using Microsoft.Extensions.Options;
using Moq;
using Moq.Protected;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Infrastructure.Integrations;
using System.Net;
using System.Text;
using System.Text.Json;

namespace ReceiptAI.UnitTests;

public class GroqReceiptAiServiceTests
{
	private GroqReceiptAiService CreateService(HttpResponseMessage response)
	{
		var handlerMock = new Mock<HttpMessageHandler>();

		handlerMock
			.Protected()
			.Setup<Task<HttpResponseMessage>>(
				"SendAsync",
				ItExpr.IsAny<HttpRequestMessage>(),
				ItExpr.IsAny<CancellationToken>())
			.ReturnsAsync(response);

		var httpClient = new HttpClient(handlerMock.Object);

		var settings = Options.Create(new GroqSettings
		{
			ApiKey = "test-key",
			BaseUrl = "https://api.test.com",
			Model = "test-model"
		});

		return new GroqReceiptAiService(httpClient, settings);
	}

	[Fact]
	public async Task ExtractReceiptAsync_Should_Return_Data_When_Response_Is_Valid()
	{
		// Arrange
		var groqResponse = new
		{
			choices = new[]
			{
				new
				{
					message = new
					{
						content = JsonSerializer.Serialize(new
						{
							merchantName = "Tesco",
							purchaseDate = "2025-01-10",
							totalAmount = 25.50,
							currency = "GBP",
							category = "Groceries",
							rawText = "Sample receipt"
						})
					}
				}
			}
		};

		var response = new HttpResponseMessage(HttpStatusCode.OK)
		{
			Content = new StringContent(
				JsonSerializer.Serialize(groqResponse),
				Encoding.UTF8,
				"application/json")
		};

		var service = CreateService(response);

		// Act
		var result = await service.ExtractReceiptAsync("https://image.com/test.jpg");

		// Assert
		Assert.Null(result.ErrorMessage);
		Assert.Equal("Tesco", result.MerchantName);
		Assert.Equal(25.50m, result.TotalAmount);
		Assert.Equal("GBP", result.Currency);
		Assert.Equal("Groceries", result.Category);
		Assert.Equal("Sample receipt", result.RawText);
	}

	[Fact]
	public async Task ExtractReceiptAsync_Should_Return_Error_When_ImageUrl_Is_Invalid()
	{
		// Arrange
		var service = CreateService(new HttpResponseMessage(HttpStatusCode.OK));

		// Act
		var result = await service.ExtractReceiptAsync("");

		// Assert
		Assert.Equal("ImageUrl is required.", result.ErrorMessage);
	}

	[Fact]
	public async Task ExtractReceiptAsync_Should_Return_Error_When_Http_Fails()
	{
		// Arrange
		var response = new HttpResponseMessage(HttpStatusCode.BadRequest)
		{
			Content = new StringContent("Bad request")
		};

		var service = CreateService(response);

		// Act
		var result = await service.ExtractReceiptAsync("https://image.com/test.jpg");

		// Assert
		Assert.Contains("Groq request failed", result.ErrorMessage);
	}

	[Fact]
	public async Task ExtractReceiptAsync_Should_Return_Error_When_Response_Is_Invalid_Json()
	{
		// Arrange
		var badResponse = new HttpResponseMessage(HttpStatusCode.OK)
		{
			Content = new StringContent("invalid json")
		};

		var service = CreateService(badResponse);

		// Act
		var result = await service.ExtractReceiptAsync("https://image.com/test.jpg");

		// Assert
		Assert.Contains("Failed to parse Groq response", result.ErrorMessage);
	}
}
