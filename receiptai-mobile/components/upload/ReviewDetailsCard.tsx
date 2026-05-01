import React from "react";
import { Text, View } from "react-native";
import { ChromeButton } from "./ChromeButton";
import { Field } from "./Field";
import { StepBadge } from "./StepBadge";

export function ReviewDetailsCard({
  merchantName,
  setMerchantName,
  purchaseDate,
  setPurchaseDate,
  totalAmount,
  setTotalAmount,
  currency,
  setCurrency,
  category,
  setCategory,
  loading,
  imageUrl,
  imagePublicId,
  onSave,
}: {
  merchantName: string;
  setMerchantName: (value: string) => void;
  purchaseDate: string;
  setPurchaseDate: (value: string) => void;
  totalAmount: string;
  setTotalAmount: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  loading: boolean;
  imageUrl: string;
  imagePublicId: string;
  onSave: () => void;
}) {
  return (
    <View className="mt-4 rounded-[32px] border border-slate-300 bg-white p-4">
      <View className="flex-row items-center gap-3">
        <StepBadge value="3" />
        <View>
          <Text className="text-lg font-black text-slate-950">
            Review details
          </Text>
          <Text className="text-xs font-semibold text-slate-500">
            Edit before saving
          </Text>
        </View>
      </View>

      <View className="mt-5 gap-4">
        <Field
          label="Merchant"
          value={merchantName}
          onChangeText={setMerchantName}
          placeholder="e.g. Tesco"
        />

        <Field
          label="Purchase date"
          value={purchaseDate}
          onChangeText={setPurchaseDate}
          placeholder="YYYY-MM-DD"
        />

        <Field
          label="Total amount"
          value={totalAmount}
          onChangeText={setTotalAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field
              label="Currency"
              value={currency}
              onChangeText={setCurrency}
              placeholder="GBP"
            />
          </View>

          <View className="flex-1">
            <Field
              label="Category"
              value={category}
              onChangeText={setCategory}
              placeholder="Other"
            />
          </View>
        </View>
      </View>

      <View className="mt-5 rounded-3xl bg-slate-950 p-4">
        <Text className="text-xs font-black uppercase tracking-widest text-slate-400">
          Ready to save
        </Text>
        <Text className="mt-1 text-2xl font-black text-white">
          {totalAmount ? `${currency} ${totalAmount}` : "No total yet"}
        </Text>
      </View>

      <View className="mt-4">
        <ChromeButton
          label="Save Receipt"
          onPress={onSave}
          disabled={loading || !imageUrl || !imagePublicId}
          loading={loading}
        />
      </View>
    </View>
  );
}
