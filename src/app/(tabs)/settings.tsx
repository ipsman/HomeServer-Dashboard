import { useSettings } from "@/context/settingsController";
import { setServerIp } from "@/services/backendService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { theme, setTheme } = useSettings();
  const isDarkMode = theme?.toLowerCase() === "dark";

  const [serverUrl, setServerUrl] = useState("192.168.0.115:8080");
  const [apiKey, setApiKey] = useState("••••••••••••••••");
  const [refreshInterval, setRefreshInterval] = useState("2");

  // Betöltjük a mentett URL-t Androidon/iOS-en indításkor
  useEffect(() => {
    AsyncStorage.getItem("serverUrl").then((saved) => {
      if (saved) {
        setServerUrl(saved);
      }
    });
  }, []);

  const handleSaveSettings = async () => {
    try {
      await setServerIp(serverUrl);
      Alert.alert("Success", "Server settings saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save settings.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-900">
      <ScrollView
        className="flex-1 px-5 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="text-2xl font-bold text-center mb-5 text-slate-800 dark:text-white">
          Settings
        </Text>

        {/* 1. App Téma Beállítások */}
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm mb-4 border border-slate-200 dark:border-slate-700">
          <Text className="text-xs font-bold text-slate-400 uppercase mb-2">
            Appearance
          </Text>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-base text-slate-700 dark:text-slate-200 font-medium">
              Dark Mode
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={(value) => setTheme(value ? "dark" : "light")}
              trackColor={{ false: "#cbd5e1", true: "#38bdf8" }}
              thumbColor={"#ffffff"}
            />
          </View>
        </View>

        {/* 2. Szerver Kapcsolat */}
        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <Text className="text-xs font-bold text-slate-400 uppercase mb-3">
            Server Connection
          </Text>

          <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Server IP & Port (pl. 192.168.0.115:8080)
          </Text>
          <TextInput
            className="border border-slate-200 dark:border-slate-700 p-3 rounded-xl mb-3 text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
            placeholder="192.168.0.115:8080"
            placeholderTextColor="#94a3b8"
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
          />

          <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            API Token
          </Text>
          <TextInput
            className="border border-slate-200 dark:border-slate-700 p-3 rounded-xl mb-3 text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
            placeholder="Enter API Key"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={apiKey}
            onChangeText={setApiKey}
          />

          <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Auto Refresh Interval (seconds)
          </Text>
          <TextInput
            className="border border-slate-200 dark:border-slate-700 p-3 rounded-xl mb-4 text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
            placeholder="2"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            value={refreshInterval}
            onChangeText={setRefreshInterval}
          />

          <TouchableOpacity
            onPress={handleSaveSettings}
            className="bg-blue-600 p-3.5 rounded-xl items-center"
          >
            <Text className="text-white font-bold text-sm">
              Save Server Config
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Credits / App Info */}
        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <Text className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
            HomeServer Dashboard
          </Text>
          <Text className="text-xs text-slate-400 dark:text-slate-400">
            Version 1.0.0 — Developed by Máté Auer ©️ MateDevs
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}