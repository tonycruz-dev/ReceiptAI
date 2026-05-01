import React from "react";
import { Text, View } from "react-native";

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-3xl bg-slate-950 p-4">
      <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </Text>
      <Text numberOfLines={1} className="mt-2 text-lg font-black text-white">
        {value}
      </Text>
    </View>
  );
}
