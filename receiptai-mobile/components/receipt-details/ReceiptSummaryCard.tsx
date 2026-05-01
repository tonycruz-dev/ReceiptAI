import React from "react";
import { Text, View } from "react-native";
import type { ReceiptDto } from "@/types/receipt";
import { DetailRow } from "./DetailRow";
import { formatAmount } from "@/lib/utils/receiptFormatters";

export function ReceiptSummaryCard({
  receipt,
  purchaseDate,
  createdDate,
}: {
  receipt: ReceiptDto;
  purchaseDate: string;
  createdDate: string;
}) {
  return (
    <View
      className="mt-4 rounded-[32px] border border-slate-300 bg-white p-4"
      style={{
        shadowColor: "#020617",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-lg font-black text-slate-950">Summary</Text>

        <View className="rounded-full bg-slate-100 px-3 py-1">
          <Text className="text-[10px] font-black uppercase text-slate-700">
            Saved
          </Text>
        </View>
      </View>

      <DetailRow label="Merchant" value={receipt.merchantName} />
      <DetailRow label="Purchase" value={purchaseDate} />
      <DetailRow label="Category" value={receipt.category} />
      <DetailRow label="Created" value={createdDate} />
      <DetailRow label="Currency" value={receipt.currency} />

      <View className="mt-4 rounded-3xl bg-slate-950 p-4">
        <Text className="text-xs font-black uppercase tracking-widest text-slate-400">
          Total paid
        </Text>
        <Text className="mt-1 text-3xl font-black text-white">
          {formatAmount(receipt.currency, receipt.totalAmount)}
        </Text>
      </View>
    </View>
  );
}
