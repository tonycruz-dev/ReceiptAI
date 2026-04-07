// This file defines the RootLayout component, which serves as the main layout for the application.
// It wraps the entire application in the ReceiptsProvider, which provides context for managing receipts throughout the app.
// The RootLayout component also sets up the navigation stack using the Stack component from expo-router, 
// defining the main tabs screen and a screen for displaying receipt details based on the receipt ID.

import "../global.css";
import { Stack } from "expo-router";
import { ReceiptsProvider } from "@/context/ReceiptsProvider";
export default function RootLayout() {
  return (
    <ReceiptsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="receipts/[id]" />
      </Stack>
    </ReceiptsProvider>
  );
}
