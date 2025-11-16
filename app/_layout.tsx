import { PortalHost } from "@rn-primitives/portal";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
    </ConvexProvider>
  );
}
