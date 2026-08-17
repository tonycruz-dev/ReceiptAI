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
	private GroqReceiptAiService CreateService(
		HttpResponseMessage response,
		Action<HttpRequestMessage>? inspectRequest = null)
	{
		var handlerMock = new Mock<HttpMessageHandler>();

		handlerMock
			.Protected()
			.Setup<Task<HttpResponseMessage>>(
				"SendAsync",
				ItExpr.IsAny<HttpRequestMessage>(),
				ItExpr.IsAny<CancellationToken>())
			.Callback<HttpRequestMessage, CancellationToken>((request, _) =>
				inspectRequest?.Invoke(request))
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
							category = "Groceries"
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
		Assert.Null(result.RawText);
	}

	[Fact]
	public async Task ExtractReceiptAsync_Should_Send_Qwen_Multimodal_Request_Without_ResponseFormat()
	{
		var responseBody = JsonSerializer.Serialize(new
		{
			choices = new[]
			{
				new
				{
					message = new
					{
						content = "{\"merchantName\":null,\"purchaseDate\":null," +
							"\"totalAmount\":null,\"currency\":null,\"category\":null}"
					}
				}
			}
		});

		var response = new HttpResponseMessage(HttpStatusCode.OK)
		{
			Content = new StringContent(responseBody, Encoding.UTF8, "application/json")
		};

		string? requestJson = null;
		var service = CreateService(response, request =>
		{
			requestJson = request.Content!.ReadAsStringAsync().GetAwaiter().GetResult();
		});

		await service.ExtractReceiptAsync("https://image.com/test.jpg");

		Assert.NotNull(requestJson);
		using var document = JsonDocument.Parse(requestJson!);
		var root = document.RootElement;

		Assert.Equal("test-model", root.GetProperty("model").GetString());
		Assert.Equal("none", root.GetProperty("reasoning_effort").GetString());
		Assert.Equal(0.7, root.GetProperty("temperature").GetDouble());
		Assert.Equal(0.8, root.GetProperty("top_p").GetDouble());
		Assert.Equal(800, root.GetProperty("max_tokens").GetInt32());
		Assert.False(root.TryGetProperty("response_format", out _));
		Assert.Single(root.GetProperty("messages").EnumerateArray());

		var message = root.GetProperty("messages")[0];
		Assert.Equal("user", message.GetProperty("role").GetString());
		var content = message.GetProperty("content");
		Assert.Equal("text", content[0].GetProperty("type").GetString());
		Assert.Equal("image_url", content[1].GetProperty("type").GetString());
		Assert.Equal(
			"https://image.com/test.jpg",
			content[1].GetProperty("image_url").GetProperty("url").GetString());
	}

	[Fact]
	public async Task ExtractReceiptAsync_Should_Parse_Fenced_Json_With_Surrounding_Text()
	{
		var modelContent =
			"Here is the result:\n```json\n" +
			"{\"merchantName\":\"Lidl\",\"purchaseDate\":\"12/08/2026\"," +
			"\"totalAmount\":300.75,\"currency\":\"€\",\"category\":\"Groceries\"}" +
			"\n```";
		var responseBody = JsonSerializer.Serialize(new
		{
			choices = new[] { new { message = new { content = modelContent } } }
		});
		var response = new HttpResponseMessage(HttpStatusCode.OK)
		{
			Content = new StringContent(responseBody, Encoding.UTF8, "application/json")
		};

		var result = await CreateService(response)
			.ExtractReceiptAsync("https://image.com/test.jpg");

		Assert.Null(result.ErrorMessage);
		Assert.Equal("Lidl", result.MerchantName);
		Assert.Equal(new DateTime(2026, 8, 12), result.PurchaseDate);
		Assert.Equal(300.75m, result.TotalAmount);
		Assert.Equal("EUR", result.Currency);
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
		Assert.Contains("Bad request", result.ErrorMessage);
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
		Assert.Contains("Failed to parse Groq API response", result.ErrorMessage);
		Assert.Contains("invalid json", result.ErrorMessage);
	}
}
