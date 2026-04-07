# ReceiptAI.API

ReceiptAI.API is a backend ASP.NET Core Web API that processes receipt images and PDFs using AI-powered parsing (and optional OCR). The service accepts uploaded receipt images or remote image URLs, extracts structured data (merchant, date, total, currency, category, raw text, etc.), stores receipt records, and returns JSON results for web or mobile clients.

## Features

- Upload receipt images or PDFs (multipart/form-data)
- Extract structured data using AI and/or OCR
- JSON response output with normalized fields
- Create, read, and delete receipt records
- Configurable settings (AI provider, storage, logging)
- Scalable, dependency-injected ASP.NET Core design

## Tech stack

- .NET / ASP.NET Core Web API
- AI / OCR integration (configurable provider)
- RESTful JSON endpoints
- Pluggable image storage (e.g., Cloudinary)

## Quick start

Prerequisites:

- .NET SDK (version targeted by the solution)
- Optional: Visual Studio or VS Code

Clone and run:

```bash
git clone <repo-url>
cd ReceiptAI.API
dotnet restore
dotnet run
```

Or run from the solution root:

```bash
dotnet run --project ./ReceiptAI.API/ReceiptAI.API.csproj
```

The application will print listening URLs in the console (e.g., http://localhost:5000 / https://localhost:5001).

## Configuration

Important: appsettings.json containing secrets (API keys, credentials) is NOT committed with secrets in the repository. Create your own local configuration file and do not commit it.

Create `appsettings.json` (or `appsettings.Development.json`) in the ReceiptAI.API project folder (same folder as Program.cs). Example sample configuration:

```json
{
  "AI": {
    "Provider": "OpenAI",
    "ApiKey": "YOUR_API_KEY_HERE"
  },
  "Storage": {
    "Provider": "Cloudinary",
    "TempPath": "C:\\Temp\\Receipts",
    "Cloudinary": {
      "CloudName": "your-cloud-name",
      "ApiKey": "YOUR_CLOUDINARY_API_KEY",
      "ApiSecret": "YOUR_CLOUDINARY_API_SECRET"
    }
  },
  "Logging": {
    "LogLevel": "Information"
  }
}
```

Where to place the file

- Place the file at: `c:\Developer\ReceiptAI\ReceiptAI.API\appsettings.json` (or `appsettings.Development.json`).
- If you prefer a different filename, configure the host in Program.cs to load it.

Do not commit secrets

- Use `.gitignore` to exclude local config files.
- Use environment variables, `dotnet user-secrets`, or a cloud secret manager (Azure Key Vault, AWS Secrets Manager) for production secrets.

## Environment variables

ASP.NET Core supports overriding settings via environment variables. Use double underscores to separate sections.

Examples:

- `AI__Provider=OpenAI`
- `AI__ApiKey=your_api_key_here`
- `Storage__TempPath=C:\Temp\Receipts`
- `Storage__Cloudinary__CloudName=your-cloud-name`
- `Logging__LogLevel=Debug`
- `ASPNETCORE_ENVIRONMENT=Development`

Environment variables take precedence over values in appsettings.json.

## API Endpoints

Base route: `/api/receipts`

1. POST /api/receipts/upload-image

- Description: Upload an image file (multipart/form-data). The image is stored by the configured image service.
- Request: multipart/form-data with field `file`
- Example curl:

```bash
curl -X POST "http://localhost:5000/api/receipts/upload-image" \
  -F "file=@/path/to/receipt.jpg"
```

- Example response (ImageUploadResultDto):

```json
{ "publicId": "abc123", "url": "https://.../receipt.jpg", "error": null }
```

2. POST /api/receipts/extract

- Description: Run AI/OCR extraction on an image URL and return structured data.
- Request body (JSON):

```json
{ "imageUrl": "https://example.com/receipt.jpg" }
```

- Example curl:

```bash
curl -X POST "http://localhost:5000/api/receipts/extract" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://example.com/receipt.jpg"}'
```

- Example response (ReceiptExtractionResultDto):

```json
{
  "merchantName": "ACME Supermarket",
  "purchaseDate": "2026-04-06T00:00:00Z",
  "totalAmount": 42.75,
  "currency": "GBP",
  "category": "Groceries",
  "rawText": "Full OCR/AI raw text output...",
  "errorMessage": null
}
```

3. POST /api/receipts

- Description: Create/persist a receipt record.
- Request body (CreateReceiptRequest):

```json
{
  "merchantName": "ACME Supermarket",
  "purchaseDate": "2026-04-06T00:00:00Z",
  "totalAmount": 42.75,
  "currency": "GBP",
  "category": "Groceries",
  "imagePublicId": "abc123",
  "imageUrl": "https://example.com/receipt.jpg"
}
```

- Response: 201 Created with the created receipt ID (GUID).

4. GET /api/receipts

- Description: Get all receipts. Returns an array of ReceiptDto objects.

5. GET /api/receipts/{id}

- Description: Get a receipt by GUID. Returns ReceiptDto or 404 if not found.

6. DELETE /api/receipts/{id}

- Description: Delete a receipt and remove stored image if imagePublicId is present. Returns 204 No Content on success.

## Example end-to-end (upload -> extract -> create)

1. Upload file to get { publicId, url } using `POST /api/receipts/upload-image`.
2. Extract parsed fields using `POST /api/receipts/extract` with the returned `imageUrl`.
3. Persist the receipt using `POST /api/receipts` with parsed fields and imagePublicId/imageUrl.

## Example curl (upload + extract + create)

```bash
# 1) Upload
curl -X POST "http://localhost:5000/api/receipts/upload-image" \
  -F "file=@C:/path/to/receipt.jpg"

# 2) Extract (use returned URL)
curl -X POST "http://localhost:5000/api/receipts/extract" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://res.cloudinary.com/your/receipt.jpg"}'

# 3) Create
curl -X POST "http://localhost:5000/api/receipts" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantName":"ACME Supermarket",
    "purchaseDate":"2026-04-06T00:00:00Z",
    "totalAmount":42.75,
    "currency":"GBP",
    "category":"Groceries",
    "imagePublicId":"abc123",
    "imageUrl":"https://res.cloudinary.com/your/receipt.jpg"
  }'
```

## Project structure (high-level)

- ReceiptAI.API/ — API project (Controllers, Program.cs, appsettings)
  - Controllers/ReceiptsController.cs
- ReceiptAI.Application/ — DTOs, interfaces, application logic
  - DTOs/, Interfaces/
- ReceiptAI.Domain/ — domain entities
- ReceiptAI.Infrastructure/ — DI, persistence, integrations (Cloudinary, DB)

## Notes / Security

- Do NOT commit API keys, secrets, or production appsettings files.
- Add local config files to `.gitignore`.
- Validate uploaded files and enforce size/type limits in production.
- Use HTTPS and protect endpoints with authentication/authorization as required.

## Contributing

- Follow existing patterns (dependency injection, DTOs, interfaces).
- Add tests and update documentation for new endpoints.
- Do not expose secrets in PRs.

## License

Add a LICENSE file to the repository root (e.g., MIT).

---

If you want, I can also add a minimal `appsettings.Development.json` sample file, a Postman collection, or a small README snippet in the solution root. Just tell me which you'd like.
