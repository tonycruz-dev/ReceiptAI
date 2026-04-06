using ReceiptAI.Application.Interfaces;
using ReceiptAI.Domain.Entities;
using ReceiptAI.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

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
}
