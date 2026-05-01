import PageBackground from "./PageBackground";
import { PAGE_SHELL_CLASS_NAME } from "../../utils/receiptFormatters";

const skeletonCards = Array.from({ length: 6 });

export default function ReceiptLoadingState() {
  return (
    <section className={PAGE_SHELL_CLASS_NAME}>
      <PageBackground />

      <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="animate-pulse">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="h-3 w-24 rounded-full bg-slate-300" />
              <div className="h-12 w-64 rounded-2xl bg-slate-300" />
              <div className="h-4 w-full max-w-xl rounded-full bg-slate-200" />
              <div className="h-4 w-2/3 rounded-full bg-slate-200" />
            </div>

            <div className="h-12 w-full rounded-2xl bg-slate-900/20 sm:w-44" />
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur"
              >
                <div className="h-3 w-24 rounded-full bg-slate-200" />
                <div className="mt-4 h-8 w-36 rounded-2xl bg-slate-300" />
                <div className="mt-3 h-4 w-28 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {skeletonCards.map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-4xl border border-white/70 bg-white/85 shadow-lg shadow-slate-200/60 backdrop-blur"
              >
                <div className="aspect-4/3 bg-slate-200" />

                <div className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-full space-y-3">
                      <div className="h-6 w-2/3 rounded-full bg-slate-300" />
                      <div className="h-4 w-1/3 rounded-full bg-slate-200" />
                    </div>

                    <div className="h-7 w-24 rounded-full bg-slate-200" />
                  </div>

                  <div className="h-px w-full bg-slate-100" />

                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-3">
                      <div className="h-3 w-12 rounded-full bg-slate-200" />
                      <div className="h-6 w-24 rounded-full bg-slate-300" />
                    </div>

                    <div className="h-4 w-24 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
