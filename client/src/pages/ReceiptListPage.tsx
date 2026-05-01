import { useEffect, useState } from "react";
import { useReceipts } from "../context/useReceipts";
import { AnimatePresence, motion } from "framer-motion";

import PageBackground from "../components/receipts/PageBackground";
import ReceiptCard from "../components/receipts/ReceiptCard";
import ReceiptDashboardHeader from "../components/receipts/ReceiptDashboardHeader";
import ReceiptEmptyState from "../components/receipts/ReceiptEmptyState";
import ReceiptErrorState from "../components/receipts/ReceiptErrorState";
import ReceiptLoadingState from "../components/receipts/ReceiptLoadingState";
import ReceiptStats from "../components/receipts/ReceiptStats";
import ReceiptPagination from "../components/receipts/ReceiptPagination";
import ReceiptFilters from "../components/receipts/ReceiptFilters";

import {
  formatDate,
  getLatestReceiptDateValue,
  PAGE_SHELL_CLASS_NAME,
  type ReceiptLike,
} from "../utils/receiptFormatters";

export default function ReceiptListPage() {
  const [pageError, setPageError] = useState("");

  const {receipts, loading, error, fetchReceipts, page, setPage, totalPages, hasNextPage } = useReceipts();

  useEffect(() => {
    async function loadReceipts() {
      try {
        setPageError("");
        await fetchReceipts();
      } catch {
        setPageError("Failed to load receipts.");
      }
    }

    loadReceipts();
  }, [fetchReceipts]);

  const safeReceipts = receipts as ReceiptLike[];

  const totalSpent = safeReceipts.reduce((sum, receipt) => {
    const amount = Number(receipt?.totalAmount);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const primaryCurrency =
    safeReceipts.find(
      (receipt) =>
        typeof receipt?.currency === "string" && receipt.currency.trim(),
    )?.currency || "GBP";

  const latestReceiptDateValue = getLatestReceiptDateValue(safeReceipts);

  const latestReceiptDate = latestReceiptDateValue
    ? formatDate(latestReceiptDateValue)
    : "No receipts yet";

  const displayError = pageError || error;

  const handleRetry = async () => {
    try {
      setPageError("");
      await fetchReceipts();
    } catch {
      setPageError("Failed to load receipts.");
    }
  };

  if (loading) {
    return <ReceiptLoadingState />;
  }

  if (displayError) {
    return (
      <ReceiptErrorState errorMessage={displayError} onRetry={handleRetry} />
    );
  }

  return (
    <section className={PAGE_SHELL_CLASS_NAME}>
      <PageBackground />

      <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <ReceiptDashboardHeader />
        <ReceiptFilters />
        <ReceiptStats
          totalSpent={totalSpent}
          primaryCurrency={primaryCurrency}
          receiptCount={safeReceipts.length}
          latestReceiptDate={latestReceiptDate}
        />

        {safeReceipts.length === 0 ? (
          <ReceiptEmptyState />
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${page}-${safeReceipts.map((r) => r.id).join("-")}`}
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                initial="hidden"
                animate="show"
                exit="exit"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.06,
                      delayChildren: 0.04,
                    },
                  },
                  exit: {
                    transition: {
                      staggerChildren: 0.025,
                      staggerDirection: -1,
                    },
                  },
                }}
              >
                {safeReceipts.map((receipt) => (
                  <motion.div
                    layout
                    key={receipt.id}
                    variants={{
                      hidden: {
                        opacity: 0,
                        y: 18,
                        scale: 0.96,
                        filter: "blur(6px)",
                      },
                      show: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        transition: {
                          type: "spring",
                          stiffness: 260,
                          damping: 24,
                          mass: 0.8,
                        },
                      },
                      exit: {
                        opacity: 0,
                        y: -8,
                        scale: 0.98,
                        filter: "blur(4px)",
                        transition: {
                          duration: 0.16,
                          ease: "easeInOut",
                        },
                      },
                    }}
                    whileHover={{
                      y: -4,
                      transition: { duration: 0.18, ease: "easeOut" },
                    }}
                  >
                    <ReceiptCard receipt={receipt} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            <ReceiptPagination
              page={page}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </section>
  );
}
