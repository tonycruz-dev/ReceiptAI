import { useEffect, useState } from "react";
import { useReceipts } from "../../context/useReceipts";
import { getReceiptCategories } from "../../api/receipts";

export default function ReceiptFilters() {
  const {
    filter,
    setFilter,
    category,
    setCategory,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    selectedDate,
    setSelectedDate,
  } = useReceipts();

  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const data = await getReceiptCategories();
      setCategories(data);
    }

    loadCategories();
  }, []);


  return (
    <div className="mb-8 rounded-2xl bg-white/80 p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="all">All receipts</option>
          <option value="recent">Recent receipts</option>
          <option value="category">By category</option>
          <option value="date-range">Date range</option>
          <option value="by-date">By exact date</option>
          <option value="this-month">This month</option>
        </select>

        {filter === "category" && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        )}

        {filter === "date-range" && (
          <>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            />
          </>
        )}

        {filter === "by-date" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />
        )}
      </div>
    </div>
  );
}
