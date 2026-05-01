import React from "react";
import { Text, View } from "react-native";
import { formatAmount } from "@/lib/utils/receiptFormatters";


function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-3xl bg-slate-950 p-4">
      <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </Text>
      <Text className="mt-2 text-xl font-black text-white">{value}</Text>
    </View>
  );
}

export function ReceiptHeader({
  totalSpent,
  currency,
  receiptCount,
}: {
  totalSpent: number;
  currency: string;
  receiptCount: number;
}) {
  return (
    <View className="rounded-[32px] bg-slate-950 p-5">
      <Text className="text-xs font-bold uppercase tracking-[4px] text-slate-400">
        Receipt dashboard
      </Text>

      <Text className="mt-2 text-3xl font-black text-white">Your spending</Text>

      <View className="mt-5 flex-row gap-3">
        <StatCard label="Total" value={formatAmount(currency, totalSpent)} />
        <StatCard label="Receipts" value={String(receiptCount)} />
      </View>
    </View>
  );
}
