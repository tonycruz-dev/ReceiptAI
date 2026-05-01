import React from "react";
import { Image, Text, View } from "react-native";

export function ReceiptImagePreview({ imageUrl }: { imageUrl?: string }) {
  return (
    <View
      className="mt-4 overflow-hidden rounded-[32px] border border-slate-300 bg-white"
      style={{
        shadowColor: "#020617",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between border-b border-slate-200 px-4 py-3">
        <Text className="text-xs font-black uppercase tracking-[3px] text-slate-500">
          Receipt image
        </Text>

        <View className="rounded-full bg-slate-950 px-3 py-1">
          <Text className="text-[10px] font-black text-white">Preview</Text>
        </View>
      </View>

      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="h-[380px] w-full bg-slate-100"
          resizeMode="contain"
        />
      ) : (
        <View className="h-64 items-center justify-center bg-slate-100">
          <Text className="text-sm font-black text-slate-950">
            No image available
          </Text>
          <Text className="mt-1 text-xs font-medium text-slate-500">
            This receipt has no uploaded image.
          </Text>
        </View>
      )}
    </View>
  );
}
