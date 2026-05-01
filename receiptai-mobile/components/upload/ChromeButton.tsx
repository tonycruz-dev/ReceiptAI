import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

export function ChromeButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "dark",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "dark" | "light";
}) {
  const isDark = variant === "dark";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`items-center rounded-2xl border px-5 py-4 ${
        disabled || loading
          ? "border-slate-300 bg-slate-300"
          : isDark
            ? "border-slate-950 bg-slate-950"
            : "border-slate-300 bg-white"
      }`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text
          className={`text-sm font-black ${
            disabled || loading
              ? "text-slate-500"
              : isDark
                ? "text-white"
                : "text-slate-950"
          }`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
