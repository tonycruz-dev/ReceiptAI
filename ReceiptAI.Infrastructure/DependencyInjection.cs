using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Infrastructure.Integrations;
using ReceiptAI.Infrastructure.Persistence;
using ReceiptAI.Infrastructure.Repositories;

namespace ReceiptAI.Infrastructure;

public static class DependencyInjection
{
	public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
	{
		services.AddDbContext<ApplicationDbContext>(options =>
			options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

		services.Configure<CloudinarySettings>(configuration.GetSection("Cloudinary"));

		services.AddScoped<IReceiptRepository, ReceiptRepository>();
		services.AddScoped<IImageService, ImageService>();
		services.AddScoped<IReceiptAiService, GroqReceiptAiService>();

		return services;
	}
}