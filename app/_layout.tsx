import { PortalHost } from "@rn-primitives/portal";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { setAudioModeAsync } from "expo-audio";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../global.css";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "mixWithOthers",
    }).catch((error) => {
      console.warn("Failed to set audio mode", error);
    });
  }, []);

  return (
    <ConvexProvider client={convex}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
    </ConvexProvider>
  );
}
