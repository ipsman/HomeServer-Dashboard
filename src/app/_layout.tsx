import { WishProvider } from "@/context/WishContext";
import { SettingsProvider } from "@/context/settingsController";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <WishProvider>
        <SettingsProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SettingsProvider>
      </WishProvider>
    </GestureHandlerRootView>
  );
}
