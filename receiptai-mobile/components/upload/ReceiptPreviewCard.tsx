import React from "react";
import { Image, Text, View } from "react-native";
import { StepBadge } from "./StepBadge";

export function ReceiptPreviewCard({
  imageUrl,
  fileUri,
}: {
  imageUrl: string;
  fileUri: string;
}) {
  const hasImage = imageUrl || fileUri;

  return (
    <View className="mt-4 overflow-hidden rounded-[32px] border border-slate-300 bg-white">
      <View className="flex-row items-center justify-between border-b border-slate-200 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <StepBadge value="2" />
          <View>
            <Text className="text-lg font-black text-slate-950">Preview</Text>
            <Text className="text-xs font-semibold text-slate-500">
              Receipt image
            </Text>
          </View>
        </View>

        <View className="rounded-full bg-slate-950 px-3 py-1">
          <Text className="text-[10px] font-black text-white">
            {hasImage ? "Ready" : "Empty"}
          </Text>
        </View>
      </View>

      {hasImage ? (
        <Image
          source={{ uri: imageUrl || fileUri }}
          className="h-[360px] w-full bg-slate-100"
          resizeMode="contain"
        />
      ) : (
        <View className="h-64 items-center justify-center bg-slate-100 px-6">
          <Text className="text-base font-black text-slate-950">
            No preview yet
          </Text>
          <Text className="mt-2 text-center text-sm font-semibold text-slate-500">
            Your selected receipt will appear here.
          </Text>
        </View>
      )}
    </View>
  );
}
