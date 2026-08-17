using Microsoft.Extensions.Options;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;
using System.Globalization;
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

	private static readonly JsonSerializerOptions JsonOptions = new()
	{
		PropertyNameCaseInsensitive = true
	};

	private const string ReceiptExtractionPrompt =
		"""
		Read this receipt image and extract the receipt information.

		Return ONLY one valid JSON object with exactly these properties:

		{
		  "merchantName": null,
		  "purchaseDate": null,
		  "totalAmount": null,
		  "currency": null,
		  "category": null
		}

		Rules:

		merchantName:
		Main shop, merchant or business name.

		purchaseDate:
		Transaction/purchase date formatted as YYYY-MM-DD.
		For European dates, interpret DD/MM/YYYY correctly.

		totalAmount:
		The FINAL grand total / amount actually paid.
		Do NOT return subtotal, VAT, tax, change, cash tendered,
		discount total or individual item prices.

		The value must be a JSON number without a currency symbol.

		currency:
		Return an ISO currency code such as GBP, EUR or USD.

		category:
		Return exactly one of:
		Groceries
		Dining
		Transport
		Shopping
		Utilities
		Health
		Other

		If a value cannot be reliably read, return null.

		Do not return markdown.
		Do not use JSON code fences.
		Do not provide explanations.
		Do not add additional properties.
		The response must start with { and end with }.
		""";

	public async Task<ReceiptExtractionResultDto> ExtractReceiptAsync(
		string imageUrl,
		CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(imageUrl))
		{
			return Error("ImageUrl is required.");
		}

		if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) ||
			(uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
		{
			return Error("ImageUrl must be a valid http/https URL.");
		}

		var requestBody = new
		{
			model = _settings.Model,
			reasoning_effort = "none",
			temperature = 0.7,
			top_p = 0.8,
			max_tokens = 800,
			messages = new object[]
			{
				new
				{
					role = "user",
					content = new object[]
					{
						new
						{
							type = "text",
							text = ReceiptExtractionPrompt
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

		try
		{
			using var request = new HttpRequestMessage(
				HttpMethod.Post,
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
				return Error(
					$"Groq request failed: {(int)response.StatusCode} " +
					$"{response.ReasonPhrase}. {responseText}");
			}

			return ParseGroqResponse(responseText);
		}
		catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
		{
			return Error("Receipt extraction was cancelled.");
		}
		catch (HttpRequestException ex)
		{
			return Error($"Could not contact Groq. {ex.Message}");
		}
		catch (Exception ex)
		{
			return Error($"Receipt extraction failed. {ex.Message}");
		}
	}

	private static ReceiptExtractionResultDto ParseGroqResponse(string responseText)
	{
		try
		{
			using var document = JsonDocument.Parse(responseText);
			var root = document.RootElement;

			if (!root.TryGetProperty("choices", out var choices) ||
				choices.ValueKind != JsonValueKind.Array ||
				choices.GetArrayLength() == 0)
			{
				return Error("Groq response did not contain any choices.");
			}

			var firstChoice = choices[0];
			if (firstChoice.ValueKind != JsonValueKind.Object ||
				!firstChoice.TryGetProperty("message", out var message) ||
				message.ValueKind != JsonValueKind.Object)
			{
				return Error("Groq response did not contain a valid message.");
			}

			if (!message.TryGetProperty("content", out var contentElement) ||
				contentElement.ValueKind != JsonValueKind.String)
			{
				return Error("Groq response did not contain string message content.");
			}

			var content = contentElement.GetString();
			if (string.IsNullOrWhiteSpace(content))
			{
				return Error("Groq returned empty message content.");
			}

			var cleanedJson = ExtractJsonObject(content);
			if (cleanedJson is null)
			{
				return Error(
					"Qwen response did not contain a JSON object. " +
					$"Model content: {content}");
			}

			GroqReceiptResponse? extracted;
			try
			{
				extracted = JsonSerializer.Deserialize<GroqReceiptResponse>(
					cleanedJson,
					JsonOptions);
			}
			catch (JsonException ex)
			{
				return Error(
					$"Could not parse Qwen receipt JSON. {ex.Message} " +
					$"Model content: {content}");
			}

			if (extracted is null)
			{
				return Error($"Qwen returned an empty receipt object. Model content: {content}");
			}

			return new ReceiptExtractionResultDto
			{
				MerchantName = NormalizeString(extracted.MerchantName),
				PurchaseDate = ParsePurchaseDate(extracted.PurchaseDate),
				TotalAmount = extracted.TotalAmount,
				Currency = NormalizeCurrency(extracted.Currency),
				Category = NormalizeString(extracted.Category),
				RawText = null
			};
		}
		catch (JsonException ex)
		{
			return Error(
				$"Failed to parse Groq API response. {ex.Message} " +
				$"Response body: {responseText}");
		}
	}

	private static string? ExtractJsonObject(string content)
	{
		var cleaned = content.Trim();

		if (cleaned.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
		{
			cleaned = cleaned[7..].TrimStart();
		}
		else if (cleaned.StartsWith("```", StringComparison.Ordinal))
		{
			cleaned = cleaned[3..].TrimStart();
		}

		if (cleaned.EndsWith("```", StringComparison.Ordinal))
		{
			cleaned = cleaned[..^3].TrimEnd();
		}

		var objectStart = cleaned.IndexOf('{');
		var objectEnd = cleaned.LastIndexOf('}');

		if (objectStart < 0 || objectEnd < objectStart)
		{
			return null;
		}

		return cleaned[objectStart..(objectEnd + 1)];
	}

	private static DateTime? ParsePurchaseDate(string? value)
	{
		if (string.IsNullOrWhiteSpace(value))
		{
			return null;
		}

		var trimmed = value.Trim();
		if (DateTime.TryParseExact(
				trimmed,
				"yyyy-MM-dd",
				CultureInfo.InvariantCulture,
				DateTimeStyles.None,
				out var exactDate))
		{
			return exactDate;
		}

		if (DateTime.TryParse(
				trimmed,
				CultureInfo.GetCultureInfo("en-GB"),
				DateTimeStyles.None,
				out var fallbackDate))
		{
			return fallbackDate;
		}

		return null;
	}

	private static string? NormalizeCurrency(string? currency)
	{
		if (string.IsNullOrWhiteSpace(currency))
		{
			return null;
		}

		return currency.Trim().ToUpperInvariant() switch
		{
			"£" => "GBP",
			"€" => "EUR",
			"$" => "USD",
			var code => code
		};
	}

	private static string? NormalizeString(string? value) =>
		string.IsNullOrWhiteSpace(value) ? null : value.Trim();

	private static ReceiptExtractionResultDto Error(string message) =>
		new() { ErrorMessage = message };

	private sealed class GroqReceiptResponse
	{
		public string? MerchantName { get; set; }
		public string? PurchaseDate { get; set; }
		public decimal? TotalAmount { get; set; }
		public string? Currency { get; set; }
		public string? Category { get; set; }
	}
}
