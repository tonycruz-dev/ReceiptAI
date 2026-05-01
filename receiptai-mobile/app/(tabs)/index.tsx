import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useReceipts } from "@/hooks/useReceipts";
import { ReceiptHeader } from "@/components/receipts/ReceiptHeader";
import { ReceiptCard } from "@/components/receipts/ReceiptCard";
import { ReceiptFilters } from "@/components/receipts/ReceiptFilters";
import { ReceiptPagination } from "@/components/receipts/ReceiptPagination";
import type { FilterOption } from "@/types/receipt";

export default function ReceiptListScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const {receipts, loading, fetchReceipts, deleteReceipt,
    page, setPage, totalPages,  hasNextPage,
    filter, setFilter, category, setCategory,
    fromDate, setFromDate, toDate, setToDate,
    selectedDate, setSelectedDate, categories,
    fetchCategories,
  } = useReceipts();

  const loadReceipts = useCallback(async () => {
    try {
      await fetchReceipts();
    } finally {
      setRefreshing(false);
    }
  }, [fetchReceipts]);

  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [loadReceipts]),
  );

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories]),
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadReceipts();
  }, [loadReceipts, setPage]);

  const resetFilters = useCallback(() => {
    setCategory("");
    setFromDate("");
    setToDate("");
    setSelectedDate("");
  }, [setCategory, setFromDate, setToDate, setSelectedDate]);

  const chooseFilter = useCallback(
    (value: FilterOption) => {
      setPage(1);
      setFilter(value);
      resetFilters();
    },
    [setPage, setFilter, resetFilters],
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert("Delete receipt", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReceipt(id);
            } catch {
              Alert.alert("Error", "Failed to delete receipt.");
            }
          },
        },
      ]);
    },
    [deleteReceipt],
  );

  const totalSpent = useMemo(
    () => receipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0),
    [receipts],
  );

  const currency = receipts.length > 0 ? receipts[0].currency : "GBP";

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-slate-950">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#fff" />
          <Text className="mt-3 text-sm font-bold text-white">
            Loading receipts...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-slate-100">
      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View>
            <ReceiptHeader
              totalSpent={totalSpent}
              currency={currency}
              receiptCount={receipts.length}
            />

            <ReceiptFilters
              filter={filter}
              chooseFilter={chooseFilter}
              category={category}
              setCategory={setCategory}
              categories={categories}
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              setPage={setPage}
            />

            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-lg font-black text-slate-950">
                Receipts
              </Text>
              <Text className="text-xs font-bold text-slate-600">
                Page {page} / {totalPages || 1}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="rounded-[28px] border border-dashed border-slate-400 bg-white p-8">
            <Text className="text-center text-xl font-black text-slate-950">
              No receipts found
            </Text>
            <Text className="mt-2 text-center font-medium text-slate-600">
              Upload a receipt or adjust your filters.
            </Text>
          </View>
        }
        ListFooterComponent={
          <ReceiptPagination
            page={page}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            setPage={setPage}
          />
        }
        renderItem={({ item }) => (
          <ReceiptCard receipt={item} onDelete={handleDelete} />
        )}
      />
    </SafeAreaView>
  );
}