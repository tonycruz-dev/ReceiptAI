import React, { Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import type { ReceiptDto } from "@/types/receipt";
import { formatAmount } from "@/lib/utils/receiptFormatters";

export function ReceiptCard({
  receipt,
  onDelete,
}: {
  receipt: ReceiptDto;
  onDelete: (id: string) => void;
}) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/receipts/[id]",
          params: { id: receipt.id },
        })
      }
      className="mb-3 flex-row rounded-3xl border border-slate-300 bg-white p-3"
    >
      <View className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-200">
        {receipt.imageUrl ? (
          <Image
            source={{ uri: receipt.imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[10px] font-bold text-slate-500">
              No image
            </Text>
          </View>
        )}
      </View>

      <View className="ml-3 flex-1 justify-between">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <Text
              numberOfLines={1}
              className="text-base font-black text-slate-950"
            >
              {receipt.merchantName}
            </Text>
            <Text className="mt-1 text-xs font-semibold text-slate-600">
              {new Date(receipt.purchaseDate).toLocaleDateString()}
            </Text>
          </View>

          <Text className="text-base font-black text-slate-950">
            {formatAmount(receipt.currency, receipt.totalAmount)}
          </Text>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <View className="rounded-full bg-slate-950 px-3 py-1">
            <Text className="text-[10px] font-extrabold text-white">
              {receipt.category}
            </Text>
          </View>

          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onDelete(receipt.id);
            }}
            className="rounded-full border border-red-600 px-3 py-1"
          >
            <Text className="text-[10px] font-extrabold text-red-700">
              Delete
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
