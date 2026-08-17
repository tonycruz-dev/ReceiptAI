namespace ReceiptAI.Infrastructure.Integrations;

public sealed class GroqSettings
{
	public required string ApiKey { get; set; }
	public string BaseUrl { get; set; } = "https://api.groq.com/openai/v1";
	public string Model { get; set; } = "qwen/qwen3.6-27b";
}
