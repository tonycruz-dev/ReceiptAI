// This file defines the TabLayout component, which sets up the tab-based navigation for the application 
// using the Tabs component from expo-router.
// The TabLayout component configures the appearance and behavior of the tab bar, 
// including active and inactive tint colors, hiding the tab bar when the keyboard is open, and styling the tab bar and labels. 
// It defines two tabs: one for displaying the list of receipts (index) and another for uploading new receipts (upload). 
// Each tab is associated with an icon from the Ionicons library, which changes color based on whether the tab is active or inactive. 
// The component also uses the useSafeAreaInsets hook to ensure that the 
// tab bar is properly positioned and sized according to the device's safe area insets.
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0f172a",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarHideOnKeyboard: true,
        sceneStyle: {
          backgroundColor: "#f8fafc",
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e2e8f0",
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Receipts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cloud-upload-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
