using ReceiptAI.Application.DTOs;
using ReceiptAI.Domain.Entities;

namespace ReceiptAI.Application.Interfaces;

public interface IReceiptRepository
{
	Task<List<Receipt>> GetAllAsync(CancellationToken cancellationToken = default);
	Task<Receipt?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

	Task AddAsync(Receipt receipt, CancellationToken cancellationToken = default);
	Task DeleteAsync(Receipt receipt, CancellationToken cancellationToken = default);
	Task<List<Receipt>> GetRecentReceiptsAsync(int count, CancellationToken cancellationToken = default);
	Task<List<Receipt>> GetReceiptsByCategoryAsync(string category, CancellationToken cancellationToken = default);
	Task<ReceiptSummaryDto> GetReceiptSummaryAsync(CancellationToken cancellationToken = default);
	Task<List<Receipt>> GetReceiptsByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
	Task<List<Receipt>> GetReceiptsByDateAsync(DateTime date, CancellationToken cancellationToken = default);
	Task<List<Receipt>> GetThisMonthReceiptsAsync(DateTime date, CancellationToken cancellationToken = default);
}
