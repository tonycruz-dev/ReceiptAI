using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Infrastructure.Persistence;
using ReceiptAI.Infrastructure.Repositories;

namespace ReceiptAI.Infrastructure;

public static class DependencyInjection
{
	public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
	{
		services.AddDbContext<ApplicationDbContext>(options =>
			options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

		services.AddScoped<IReceiptRepository, ReceiptRepository>();

		return services;
	}
}