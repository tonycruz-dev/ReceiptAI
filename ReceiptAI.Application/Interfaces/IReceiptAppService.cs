using ReceiptAI.Application.Common.Models;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Domain.Entities;

namespace ReceiptAI.Application.Interfaces;

public interface IReceiptAppService
{
	Task<Guid> CreateReceiptAsync(CreateReceiptForApiRequest request,  CancellationToken cancellationToken = default);
	Task<List<ResponseReceiptDto>> GetAllAsync(CancellationToken cancellationToken = default);
	Task<ResponseReceiptDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
	Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
	Task<List<ResponseReceiptDto>> GetRecentReceiptsAsync(int count, CancellationToken cancellationToken = default);
	Task<List<ResponseReceiptDto>> GetReceiptsByCategoryAsync(string category, CancellationToken cancellationToken = default);
	Task<ReceiptSummaryDto> GetReceiptSummaryAsync(CancellationToken cancellationToken = default);
	Task<List<ResponseReceiptDto>> GetReceiptsByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
	Task<List<ResponseReceiptDto>> GetReceiptsByDateAsync(DateTime date, CancellationToken cancellationToken = default);
	Task<List<ResponseReceiptDto>> GetThisMonthReceiptsAsync(DateTime date, CancellationToken cancellationToken = default);
	Task<PagedResult<ResponseReceiptDto>> GetPagedAsync(PagedRequest request,	CancellationToken cancellationToken = default);
	Task<List<string>> GetCategoriesAsync(CancellationToken cancellationToken = default);
}
