using Microsoft.EntityFrameworkCore;
using ReceiptAI.Domain.Entities;

namespace ReceiptAI.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
	public DbSet<Receipt> Receipts => Set<Receipt>();

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		modelBuilder.Entity<Receipt>(entity =>
		{
			entity.HasKey(x => x.Id);

			entity.Property(x => x.MerchantName)
				.HasMaxLength(200)
				.IsRequired();

			entity.Property(x => x.Currency)
				.HasMaxLength(10)
				.IsRequired();

			entity.Property(x => x.Category)
				.HasMaxLength(100)
				.IsRequired();

			entity.Property(x => x.ImageUrl)
				.HasMaxLength(500);

			entity.Property(x => x.TotalAmount)
				.HasColumnType("decimal(18,2)");
		});
	}
}