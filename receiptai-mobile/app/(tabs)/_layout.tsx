import React from "react";
import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,

        sceneStyle: {
          backgroundColor: "#f1f5f9",
        },

        tabBarActiveTintColor: "#0f172a",
        tabBarInactiveTintColor: "#64748b",

        tabBarStyle: {
          height: 54 + insets.bottom,
          paddingTop: 5,
          paddingBottom: 24,

          backgroundColor: "#ffffff",
          borderTopWidth: 2,
          borderTopColor: "#0f172a",

          shadowColor: "#020617",
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 16,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "900",
          marginBottom: Platform.OS === "android" ? 4 : 2,
        },

        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Receipts",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "receipt" : "receipt-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cloud-upload" : "cloud-upload-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
