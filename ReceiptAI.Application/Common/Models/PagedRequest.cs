using System;
using System.Collections.Generic;
using System.Text;

namespace ReceiptAI.Application.Common.Models;

public sealed class PagedRequest
{
	public int PageNumber { get; init; } = 1;
	public int PageSize { get; init; } = 20;
}
