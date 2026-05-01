import React, { useEffect } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useReceipts } from "@/hooks/useReceipts";

import { ChromeButton } from "@/components/receipt-details/ChromeButton";
import { ReceiptDetailHeader } from "@/components/receipt-details/ReceiptDetailHeader";
import { ReceiptImagePreview } from "@/components/receipt-details/ReceiptImagePreview";
import { ReceiptSummaryCard } from "@/components/receipt-details/ReceiptSummaryCard";

export default function ReceiptDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    selectedReceipt: receipt,
    loading,
    error,
    fetchReceiptById,
    deleteReceipt,
    clearSelectedReceipt,
  } = useReceipts();

  useEffect(() => {
    if (!id) return;

    fetchReceiptById(id);

    return () => {
      clearSelectedReceipt();
    };
  }, [id, fetchReceiptById, clearSelectedReceipt]);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  function handleDelete() {
    if (!receipt) return;

    Alert.alert("Delete receipt", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReceipt(receipt.id);
            goBack();
          } catch {
            Alert.alert("Error", "Failed to delete receipt.");
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-950">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#fff" />
          <Text className="mt-3 text-sm font-bold text-white">
            Loading receipt...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !receipt) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-black text-slate-950">
            {error ? "Something went wrong" : "Receipt not found"}
          </Text>

          {error ? (
            <Text className="mt-2 text-center font-medium text-slate-600">
              {error}
            </Text>
          ) : null}

          <View className="mt-5 w-full">
            <ChromeButton label="Back to receipts" onPress={goBack} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const purchaseDate = new Date(receipt.purchaseDate).toLocaleDateString();
  const createdDate = new Date(receipt.createdAt).toLocaleString();

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <ReceiptDetailHeader
          receipt={receipt}
          purchaseDate={purchaseDate}
          onBack={goBack}
        />

        <ReceiptImagePreview imageUrl={receipt.imageUrl ?? ""} />

        <ReceiptSummaryCard
          receipt={receipt}
          purchaseDate={purchaseDate}
          createdDate={createdDate}
        />

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <ChromeButton label="Back" onPress={goBack} />
          </View>

          <View className="flex-1">
            <ChromeButton label="Delete" onPress={handleDelete} danger />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
