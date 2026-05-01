import React from "react";
import { Text, View } from "react-native";

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-slate-200 py-3">
      <Text className="text-xs font-black uppercase tracking-widest text-slate-500">
        {label}
      </Text>

      <Text
        numberOfLines={1}
        className="ml-4 flex-1 text-right text-sm font-extrabold text-slate-950"
      >
        {value}
      </Text>
    </View>
  );
}
