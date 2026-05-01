using Microsoft.EntityFrameworkCore;
using ReceiptAI.Application.Common.Models;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Domain.Entities;
using ReceiptAI.Infrastructure.Persistence;

namespace ReceiptAI.Infrastructure.Repositories;

public class ReceiptRepository(ApplicationDbContext context) : IReceiptRepository
{
	private readonly ApplicationDbContext _context = context;

	public async Task<List<Receipt>> GetAllAsync(CancellationToken cancellationToken = default)
	{
		return await _context.Receipts
			.OrderByDescending(x => x.CreatedAt)
			.ToListAsync(cancellationToken);
	}

	public async Task<Receipt?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
	{
		return await _context.Receipts
			.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
	}

	public async Task<List<Receipt>> GetRecentReceiptsAsync(int count, CancellationToken cancellationToken = default)
	{
		return await _context.Receipts
			.OrderByDescending(x => x.CreatedAt)
			.Take(count)
			.ToListAsync(cancellationToken);
	}

	public async Task<List<Receipt>> GetReceiptsByCategoryAsync(string category, CancellationToken cancellationToken = default)
	{
		
		return await _context.Receipts
		.Where(r => r.Category.ToLower() == category.ToLower())
		.OrderByDescending(x => x.CreatedAt)
		.ToListAsync(cancellationToken);
	}

	public async Task<ReceiptSummaryDto> GetReceiptSummaryAsync(CancellationToken cancellationToken = default)
	{
		var receipts = await _context.Receipts
			.AsNoTracking()
			.OrderByDescending(x => x.CreatedAt)
			.ToListAsync(cancellationToken);

		var summary = new ReceiptSummaryDto
		{
			TotalReceipts = receipts.Count,
			TotalAmount = receipts.Sum(r => r.TotalAmount),

			Currencies = [.. receipts
				.GroupBy(r => r.Currency)
				.Select(g => new CurrencySummaryDto
				{
					Currency = g.Key,
					TotalAmount = g.Sum(x => x.TotalAmount),
					Count = g.Count()
				})
				.OrderBy(x => x.Currency)],

			Categories = [.. receipts
				.GroupBy(r => r.Category)
				.Select(g => new CategorySummaryDto
				{
					Category = g.Key,
					Count = g.Count(),
					TotalAmount = g.Sum(x => x.TotalAmount)
				})
				.OrderBy(x => x.Category)]
		};

		return summary;
	}

	public async Task<List<Receipt>> GetReceiptsByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
	{
		var fromDate = from;
		var toDate = to;

		return await _context.Receipts
			.Where(x => x.PurchaseDate.Date >= fromDate.Date && x.PurchaseDate.Date <= toDate.Date)
			.OrderByDescending(x => x.CreatedAt)
			.ToListAsync(cancellationToken);
	}

	public async Task<List<Receipt>> GetReceiptsByDateAsync(DateTime date, CancellationToken cancellationToken = default)
	{
		return await _context.Receipts
			.Where(x => x.PurchaseDate.Date == date.Date)
			.OrderByDescending(x => x.CreatedAt)
			.ToListAsync(cancellationToken);
	}
	public async Task<List<Receipt>> GetThisMonthReceiptsAsync(DateTime date, CancellationToken cancellationToken = default)
	{
		var firstDayOfMonth = new DateTime(date.Year, date.Month, 1);
		var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

		return await _context.Receipts
			.Where(x => x.PurchaseDate.Date >= firstDayOfMonth.Date && x.PurchaseDate.Date <= lastDayOfMonth.Date)
			.OrderByDescending(x => x.CreatedAt)
			.ToListAsync(cancellationToken);
	}

	public async Task AddAsync(Receipt receipt, CancellationToken cancellationToken = default)
	{
		await _context.Receipts.AddAsync(receipt, cancellationToken);
		await _context.SaveChangesAsync(cancellationToken);
	}
	public async Task DeleteAsync(Receipt receipt, CancellationToken cancellationToken = default)
	{
		_context.Receipts.Remove(receipt);
		await _context.SaveChangesAsync(cancellationToken);
	}

	public async Task<PagedResult<Receipt>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default)
	{
		var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
		var pageSize = request.PageSize switch
		{
			< 1 => 20,
			> 100 => 100,
			_ => request.PageSize
		};

		var query = _context.Receipts
			.AsNoTracking()
			.OrderByDescending(x => x.CreatedAt)
			.ThenByDescending(x => x.Id);

		var totalCount = await query.CountAsync(cancellationToken);

		var items = await query
			.Skip((pageNumber - 1) * pageSize)
			.Take(pageSize)
			.ToListAsync(cancellationToken);

		return new PagedResult<Receipt>
		{
			Items = items,
			PageNumber = pageNumber,
			PageSize = pageSize,
			TotalCount = totalCount
		};
	}

	public async Task<List<string>> GetCategoriesAsync(CancellationToken cancellationToken = default)
	{
		return await _context.Receipts
			.Where(r => !string.IsNullOrWhiteSpace(r.Category))
			.Select(r => r.Category)
			.Distinct()
			.OrderBy(c => c)
			.ToListAsync();
	}
}
