// This file defines the ReceiptDetailsScreen component, which displays the details of a specific receipt.
// It uses the useReceipts hook to access the selected receipt and related functions from the ReceiptsContext. 
// The component handles loading and error states, and displays the receipt details including the merchant name, purchase date, total amount, and an image of the receipt if available. 
// It also includes a delete button that allows the user to delete the receipt, with a confirmation alert before performing the deletion.
import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useReceipts } from "@/context/useReceipts";

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

// The DetailRow component is a reusable component that displays a label and a corresponding value in a styled row.
// It is used within the ReceiptDetailsScreen to display various details of the receipt,
// such as the merchant name, purchase date, category, and total amount.

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="border-b border-slate-100 py-4">
      <Text className="text-sm font-medium text-slate-500">{label}</Text>
      <Text className="mt-1 text-base font-semibold text-slate-900">
        {value}
      </Text>
    </View>
  );
}

// The ReceiptDetailsScreen component displays the details of a specific receipt.
// It retrieves the receipt ID from the URL parameters using useLocalSearchParams and fetches the receipt details using the useReceipts hook.
// The component handles loading and error states, and displays the receipt details including the merchant name, purchase date, total amount, and an image of the receipt if available.
// It also includes a delete button that allows the user to delete the receipt, with a confirmation alert before performing the deletion.
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

  function handleDelete() {
    if (!receipt) return;

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
              await deleteReceipt(receipt.id);

              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            } catch {
              Alert.alert("Error", "Failed to delete receipt.");
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 text-sm font-medium text-slate-500">
            Loading receipt...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-slate-900">
            Something went wrong
          </Text>
          <Text className="mt-2 text-center text-slate-600">{error}</Text>

          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            className="mt-5 rounded-2xl bg-slate-900 px-5 py-4"
          >
            <Text className="text-sm font-semibold text-white">
              Back to receipts
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!receipt) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-slate-900">
            Receipt not found
          </Text>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            className="mt-5 rounded-2xl bg-slate-900 px-5 py-4"
          >
            <Text className="text-sm font-semibold text-white">
              Back to receipts
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
               router.replace("/");
            } else {
              router.replace("/");
            }
          }}
        >
          <Text className="text-sm font-medium text-slate-500">
            ← Back to receipts
          </Text>
        </Pressable>

        <View className="mt-6 flex-row items-end justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-xs font-semibold uppercase tracking-[3px] text-slate-500">
              Receipt details
            </Text>
            <Text className="mt-2 text-4xl font-bold text-slate-900">
              {receipt.merchantName}
            </Text>
            <Text className="mt-3 text-base text-slate-600">
              Purchased on {new Date(receipt.purchaseDate).toLocaleDateString()}
            </Text>
          </View>

          <View className="rounded-2xl bg-slate-900 px-5 py-4">
            <Text className="text-xs font-medium uppercase tracking-widest text-slate-300">
              Total amount
            </Text>
            <Text className="mt-1 text-xl font-bold text-white">
              {formatAmount(receipt.currency, receipt.totalAmount)}
            </Text>
          </View>
        </View>

        <View
          className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white"
          style={{
            shadowColor: "#0f172a",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 1,
          }}
        >
          {receipt.imageUrl ? (
            <Image
              source={{ uri: receipt.imageUrl }}
              className="h-[420px] w-full bg-slate-100"
              resizeMode="contain"
            />
          ) : (
            <View className="h-72 items-center justify-center bg-slate-50">
              <Text className="text-base font-semibold text-slate-900">
                No image available
              </Text>
            </View>
          )}
        </View>

        <View
          className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5"
          style={{
            shadowColor: "#0f172a",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 1,
          }}
        >
          <Text className="text-lg font-semibold text-slate-900">Summary</Text>

          <View className="mt-3">
            <DetailRow label="Merchant" value={receipt.merchantName} />
            <DetailRow
              label="Purchase date"
              value={new Date(receipt.purchaseDate).toLocaleDateString()}
            />
            <DetailRow label="Category" value={receipt.category} />
            <DetailRow
              label="Created"
              value={new Date(receipt.createdAt).toLocaleString()}
            />
            <View className="py-4">
              <Text className="text-sm font-medium text-slate-500">
                Total paid
              </Text>
              <Text className="mt-1 text-2xl font-bold text-slate-900">
                {formatAmount(receipt.currency, receipt.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleDelete}
          className="mt-6 items-center rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
        >
          <Text className="text-sm font-semibold text-red-600">
            Delete Receipt
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
