import React from "react";
import { Text, View } from "react-native";

export function UploadHeader({
  imageUrl,
  fileUri,
  currency,
}: {
  imageUrl: string;
  fileUri: string;
  currency: string;
}) {
  return (
    <View className="rounded-[32px] bg-slate-950 p-5">
      <Text className="text-xs font-bold uppercase tracking-[4px] text-slate-400">
        Receipt upload
      </Text>

      <Text className="mt-2 text-3xl font-black text-white">
        Scan a receipt
      </Text>

      <Text className="mt-2 text-sm font-semibold leading-6 text-slate-300">
        Add a receipt image, extract the details, then review before saving.
      </Text>

      <View className="mt-5 flex-row gap-3">
        <View className="flex-1 rounded-3xl bg-white p-4">
          <Text className="text-[11px] font-black uppercase tracking-widest text-slate-500">
            Status
          </Text>
          <Text className="mt-2 text-lg font-black text-slate-950">
            {imageUrl ? "Extracted" : fileUri ? "Selected" : "Waiting"}
          </Text>
        </View>

        <View className="flex-1 rounded-3xl bg-white p-4">
          <Text className="text-[11px] font-black uppercase tracking-widest text-slate-500">
            Currency
          </Text>
          <Text className="mt-2 text-lg font-black text-slate-950">
            {currency || "GBP"}
          </Text>
        </View>
      </View>
    </View>
  );
}
