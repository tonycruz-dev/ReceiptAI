using Microsoft.Extensions.Options;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;


namespace ReceiptAI.Infrastructure.Integrations;

public sealed class GroqReceiptAiService(
	HttpClient httpClient,
	IOptions<GroqSettings> options) : IReceiptExtractionService
{
	private readonly HttpClient _httpClient = httpClient;
	private readonly GroqSettings _settings = options.Value;

	public async Task<ReceiptExtractionResultDto> ExtractReceiptAsync(
		string imageUrl,
		CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(imageUrl))
		{
			return new ReceiptExtractionResultDto
			{
				ErrorMessage = "ImageUrl is required."
			};
		}

		if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) ||
			(uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
		{
			return new ReceiptExtractionResultDto
			{
				ErrorMessage = "ImageUrl must be a valid http/https URL."
			};
		}

		var requestBody = new
		{
			model = _settings.Model,
			temperature = 0,
			max_tokens = 500,
			messages = new object[]
			{
				new
				{
					role = "system",
					content =
						"""
                        You extract receipt data from receipt images.

                        Return ONLY valid JSON with this exact schema:
                        {
                          "merchantName": "string or null",
                          "purchaseDate": "ISO-8601 date string or null",
                          "totalAmount": number or null,
                          "currency": "string or null",
                          "category": "string or null",
                          "rawText": "string or null"
                        }

                        Rules:
                        - Do not include markdown.
                        - Do not include explanation.
                        - If a field is missing, use null.
                        - Use short category names like Groceries, Dining, Transport, Shopping, Utilities, Health, Other.
                        """
				},
				new
				{
					role = "user",
					content = new object[]
					{
						new
						{
							type = "text",
							text = "Extract the receipt fields from this image and return JSON only."
						},
						new
						{
							type = "image_url",
							image_url = new
							{
								url = imageUrl
							}
						}
					}
				}
			}
		};

		using var request = new HttpRequestMessage(
			System.Net.Http.HttpMethod.Post,
			$"{_settings.BaseUrl.TrimEnd('/')}/chat/completions");

		request.Headers.Authorization =
			new AuthenticationHeaderValue("Bearer", _settings.ApiKey);

		request.Content = new StringContent(
			JsonSerializer.Serialize(requestBody),
			Encoding.UTF8,
			"application/json");

		using var response = await _httpClient.SendAsync(request, cancellationToken);
		var responseText = await response.Content.ReadAsStringAsync(cancellationToken);

		if (!response.IsSuccessStatusCode)
		{
			return new ReceiptExtractionResultDto
			{
				ErrorMessage = $"Groq request failed: {(int)response.StatusCode} {response.ReasonPhrase}. {responseText}"
			};
		}

		try
		{
			using var doc = JsonDocument.Parse(responseText);
			var content = doc
				.RootElement
				.GetProperty("choices")[0]
				.GetProperty("message")
				.GetProperty("content")
				.GetString();

			if (string.IsNullOrWhiteSpace(content))
			{
				return new ReceiptExtractionResultDto
				{
					ErrorMessage = "Groq returned empty content."
				};
			}

			var cleaned = content.Trim().Trim('`');

			var extracted = JsonSerializer.Deserialize<GroqReceiptResponse>(
				cleaned,
				new JsonSerializerOptions
				{
					PropertyNameCaseInsensitive = true
				});

			if (extracted is null)
			{
				return new ReceiptExtractionResultDto
				{
					ErrorMessage = "Could not parse Groq JSON response."
				};
			}

			DateTime? purchaseDate = null;
			if (!string.IsNullOrWhiteSpace(extracted.PurchaseDate) &&
				DateTime.TryParse(extracted.PurchaseDate, out var parsedDate))
			{
				purchaseDate = parsedDate;
			}

			return new ReceiptExtractionResultDto
			{
				MerchantName = extracted.MerchantName,
				PurchaseDate = purchaseDate,
				TotalAmount = extracted.TotalAmount,
				Currency = extracted.Currency,
				Category = extracted.Category,
				RawText = extracted.RawText
			};
		}
		catch (Exception ex)
		{
			return new ReceiptExtractionResultDto
			{
				ErrorMessage = $"Failed to parse Groq response. {ex.Message}"
			};
		}
	}

	private sealed class GroqReceiptResponse
	{
		public string? MerchantName { get; set; }
		public string? PurchaseDate { get; set; }
		public decimal? TotalAmount { get; set; }
		public string? Currency { get; set; }
		public string? Category { get; set; }
		public string? RawText { get; set; }
	}
}