using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Application.Services;
using ReceiptAI.Infrastructure.Integrations;
using ReceiptAI.Infrastructure.Persistence;
using ReceiptAI.Infrastructure.Repositories;

namespace ReceiptAI.Infrastructure;

public static class DependencyInjection
{
	public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
	{
		if (!environment.IsEnvironment("Testing"))
		{
			services.AddDbContext<ApplicationDbContext>(options =>
				options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
		}


		services.Configure<CloudinarySettings>(configuration.GetSection("Cloudinary"));

		services.Configure<GroqSettings>(configuration.GetSection("GroqSettings"));

		services.AddHttpClient<GroqReceiptAiService>();

		services.AddScoped<IReceiptRepository, ReceiptRepository>();
		services.AddScoped<IImageService, ImageService>();
		services.AddScoped<IReceiptExtractionService, GroqReceiptAiService>();
		services.AddScoped<IReceiptAppService, ReceiptAppService>();

		return services;
	}
}