using ReceiptAI.Domain.Entities;

namespace ReceiptAI.Application.Interfaces;

public interface IReceiptRepository
{
	Task<List<Receipt>> GetAllAsync(CancellationToken cancellationToken = default);
	Task<Receipt?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
	Task AddAsync(Receipt receipt, CancellationToken cancellationToken = default);
}
