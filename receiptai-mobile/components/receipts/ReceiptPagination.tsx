import React from "react";
import { Pressable, Text, View } from "react-native";

export function ReceiptPagination({
  page,
  totalPages,
  hasNextPage,
  setPage,
}: {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (totalPages <= 1) return null;

  return (
    <View className="mt-4 flex-row gap-3">
      <Pressable
        disabled={page <= 1}
        onPress={() => setPage((current) => Math.max(1, current - 1))}
        className={`flex-1 rounded-2xl py-4 ${
          page <= 1 ? "bg-slate-300" : "bg-slate-950"
        }`}
      >
        <Text
          className={`text-center text-sm font-black ${
            page <= 1 ? "text-slate-500" : "text-white"
          }`}
        >
          Previous
        </Text>
      </Pressable>

      <Pressable
        disabled={!hasNextPage}
        onPress={() => setPage((current) => Math.min(totalPages, current + 1))}
        className={`flex-1 rounded-2xl py-4 ${
          !hasNextPage ? "bg-slate-300" : "bg-slate-950"
        }`}
      >
        <Text
          className={`text-center text-sm font-black ${
            !hasNextPage ? "text-slate-500" : "text-white"
          }`}
        >
          Next
        </Text>
      </Pressable>
    </View>
  );
}
