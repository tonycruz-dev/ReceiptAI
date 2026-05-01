import React from "react";
import { Pressable, Text } from "react-native";

export function MiniButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-4 py-2 ${
        active ? "border-slate-950 bg-slate-950" : "border-slate-300 bg-white"
      }`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        className={`text-xs font-extrabold ${
          active ? "text-white" : "text-slate-950"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
