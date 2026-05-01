import React from "react";
import { Text, View } from "react-native";

export function StepBadge({ value }: { value: string }) {
  return (
    <View className="h-8 w-8 items-center justify-center rounded-full bg-slate-950">
      <Text className="text-xs font-black text-white">{value}</Text>
    </View>
  );
}
