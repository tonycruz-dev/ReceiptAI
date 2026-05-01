import React from "react";
import { Text, TextInput, View } from "react-native";

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "decimal-pad";
}) {
  return (
    <View>
      <Text className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        keyboardType={keyboardType}
        className="rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base font-bold text-slate-950"
      />
    </View>
  );
}
