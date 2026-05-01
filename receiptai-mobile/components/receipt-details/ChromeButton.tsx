import React from "react";
import { Pressable, Text } from "react-native";

export function ChromeButton({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-2xl border px-4 py-3 ${
        danger ? "border-red-600 bg-red-50" : "border-slate-950 bg-slate-950"
      }`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        className={`text-center text-sm font-black ${
          danger ? "text-red-700" : "text-white"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
