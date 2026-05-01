import React from "react";
import { Pressable, Text, View } from "react-native";
import type { ReceiptDto } from "@/types/receipt";
import { MiniStat } from "./MiniStat";
import { formatAmount } from "@/lib/utils/receiptFormatters";

export function ReceiptDetailHeader({
  receipt,
  purchaseDate,
  onBack,
}: {
  receipt: ReceiptDto;
  purchaseDate: string;
  onBack: () => void;
}) {
  return (
    <View className="rounded-[32px] bg-slate-950 p-5">
      <Pressable
        onPress={onBack}
        className="self-start rounded-full border border-slate-700 px-4 py-2"
        style={({ pressed }) => ({
          opacity: pressed ? 0.75 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        })}
      >
        <Text className="text-xs font-black text-white">← Receipts</Text>
      </Pressable>

      <Text className="mt-5 text-xs font-bold uppercase tracking-[4px] text-slate-400">
        Receipt details
      </Text>

      <Text numberOfLines={2} className="mt-2 text-3xl font-black text-white">
        {receipt.merchantName}
      </Text>

      <Text className="mt-2 text-sm font-semibold text-slate-300">
        Purchased on {purchaseDate}
      </Text>

      <View className="mt-5 flex-row gap-3">
        <MiniStat
          label="Total"
          value={formatAmount(receipt.currency, receipt.totalAmount)}
        />
        <MiniStat label="Category" value={receipt.category} />
      </View>
    </View>
  );
}
