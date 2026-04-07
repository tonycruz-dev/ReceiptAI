// This file defines the ReceiptListScreen component, which displays a list of receipts in a dashboard format.
// It uses the useReceipts hook to access the list of receipts and related functions from the ReceiptsContext. 
// The component handles loading and refreshing states, and displays the receipts in a FlatList. 
// Each receipt is rendered using the ReceiptCard component,
//  which shows the receipt image, merchant name, purchase date, category, and total amount. 
// The ReceiptListScreen also includes a header with a summary of total spending and the number of receipts,
//  as well as a button to navigate to the upload screen for adding new receipts.
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useReceipts } from "@/context/useReceipts";
import type { ReceiptDto } from "@/types/receipt";

// Helper function to format the total amount as a currency string based on the provided currency code and amount.
// This function uses the Intl.NumberFormat API to format the amount according to the specified currency.
function formatAmount(currency: string, amount: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// The ReceiptCard component is a reusable component that displays the details of a single receipt in a card format.
// It shows the receipt image, merchant name, purchase date, category, and total amount. 
// The card is pressable, allowing users to navigate to the receipt details screen when tapped. 
// It also includes a delete button that allows users to delete the receipt, with a confirmation alert before performing the deletion.
function ReceiptCard({
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
      className="mb-4 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
      style={{
        shadowColor: "#0f172a",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      <View className="relative h-52 bg-slate-100">
        {receipt.imageUrl ? (
          <Image
            source={{ uri: receipt.imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-sm font-medium text-slate-400">
              No image available
            </Text>
          </View>
        )}
      </View>

      <View className="p-5">
        <View className="mb-4 flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-xl font-bold text-slate-900">
              {receipt.merchantName}
            </Text>
            <Text className="mt-1 text-sm text-slate-500">
              {new Date(receipt.purchaseDate).toLocaleDateString()}
            </Text>
          </View>

          <View className="items-end gap-2">
            <View className="rounded-full bg-slate-100 px-3 py-1">
              <Text className="text-xs font-semibold text-slate-700">
                {receipt.category}
              </Text>
            </View>

            <Pressable
              onPress={() => onDelete(receipt.id)}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2"
            >
              <Text className="text-xs font-semibold text-red-600">Delete</Text>
            </Pressable>
          </View>
        </View>

        <View className="border-t border-slate-100 pt-4">
          <Text className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Total
          </Text>
          <Text className="mt-1 text-lg font-bold text-slate-900">
            {formatAmount(receipt.currency, receipt.totalAmount)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// The ReceiptListScreen component displays a list of receipts in a dashboard format.
// It retrieves the list of receipts and related functions from the useReceipts hook. 
// The component handles loading and refreshing states, and displays the receipts in a FlatList. 
// Each receipt is rendered using the ReceiptCard component, 
// which shows the receipt image, merchant name, purchase date, category, and total amount. 
// The ReceiptListScreen also includes a header with a summary of total spending and the number of receipts,
//  as well as a button to navigate to the upload screen for adding new receipts.
export default function ReceiptListScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { receipts, loading, fetchReceipts, deleteReceipt } = useReceipts();

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
    }, [loadReceipts])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadReceipts();
  }, [loadReceipts]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        "Delete receipt",
        "Are you sure you want to delete this receipt?",
        [
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
        ]
      );
    },
    [deleteReceipt]
  );

  const totalSpent = useMemo(
    () => receipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0),
    [receipts]
  );

  const currency = receipts.length > 0 ? receipts[0].currency : "GBP";

  if (loading && !refreshing) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 text-sm font-medium text-slate-500">
            Loading receipts...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View className="mb-8">
            <Text className="text-xs font-semibold uppercase tracking-[3px] text-slate-500">
              Dashboard
            </Text>
            <Text className="mt-2 text-4xl font-bold text-slate-900">
              Receipts
            </Text>
            <Text className="mt-3 text-base leading-6 text-slate-600">
              View, manage, and organize your uploaded receipts in one place.
            </Text>

            <View
              className="mt-5 flex-row items-center rounded-[24px] border border-slate-200 bg-white px-5 py-4"
              style={{
                shadowColor: "#0f172a",
                shadowOpacity: 0.04,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 1,
              }}
            >
              <View className="flex-1">
                <Text className="text-xs font-medium uppercase tracking-widest text-slate-400">
                  Total spent
                </Text>
                <Text className="mt-1 text-2xl font-bold text-slate-900">
                  {formatAmount(currency, totalSpent)}
                </Text>
              </View>

              <View className="mx-4 h-10 w-px bg-slate-200" />

              <View>
                <Text className="text-xs font-medium uppercase tracking-widest text-slate-400">
                  Receipts
                </Text>
                <Text className="mt-1 text-2xl font-bold text-slate-900">
                  {receipts.length}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => router.push("/upload")}
              className="mt-5 items-center justify-center rounded-2xl bg-slate-900 px-5 py-4"
            >
              <Text className="text-sm font-semibold text-white">
                Upload Receipt
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10">
            <Text className="text-center text-xl font-semibold text-slate-900">
              No receipts yet
            </Text>
            <Text className="mt-2 text-center text-slate-600">
              Start by uploading your first receipt.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ReceiptCard receipt={item} onDelete={handleDelete} />
        )}
      />
    </SafeAreaView>
  );
}
