import { useSettings } from "@/context/settingsController";
import { useWishes } from "@/context/WishContext";
import {
  connectWithPairingCode,
  generatePairingCode,
  getPartnerId,
} from "@/services/partnerService";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { girlMode, setGirlMode, theme, setTheme } = useSettings();

  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState<string>("");
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { refreshPartner } = useWishes();

  useEffect(() => {
    checkPartnerStatus();
  }, []);

  const checkPartnerStatus = async () => {
    const pId = await getPartnerId();
    setPartnerId(pId);
  };

  const handleGenerateCode = async () => {
    try {
      setLoading(true);
      const code = await generatePairingCode();
      setGeneratedCode(code);
    } catch (error) {
      Alert.alert("Error", "Failed to generate pairing code.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!inputCode.trim() || inputCode.length < 6) {
      Alert.alert("Error", "Please enter a valid 6-digit pairing code!");
      return;
    }

    try {
      setLoading(true);
      await connectWithPairingCode(inputCode.trim());
      await refreshPartner();
      await checkPartnerStatus();

      setInputCode("");
      Keyboard.dismiss();
      Alert.alert("Success! 🎉", "Successfully connected with your partner!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to connect with partner.");
    } finally {
      setLoading(false);
    }
  };

  const isDarkMode = theme?.toLowerCase() === "dark";

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

        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm mb-4 border border-transparent dark:border-slate-700">
          <View className="flex-row justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
            <Text className="text-base text-slate-700 dark:text-slate-200 font-medium">
              Girl mode
            </Text>
            <Switch
              value={girlMode}
              onValueChange={setGirlMode}
              trackColor={{ false: "#7dd3fc", true: "#ff6cc7" }}
              thumbColor={"#ffffff"}
            />
          </View>
          <View className="flex-row justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
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

        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-4 shadow-sm border border-transparent dark:border-slate-700">
          <Text className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2">
            Partner connection status
          </Text>
          {partnerId ? (
            <View className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl flex-row items-center gap-2">
              <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                Connected with your partner! ❤️
              </Text>
            </View>
          ) : (
            <Text className="text-slate-400 dark:text-slate-500 text-xs">
              Not connected yet.
            </Text>
          )}
        </View>

        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-4 shadow-sm border border-transparent dark:border-slate-700">
          <Text className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
            Your pairing code
          </Text>
          <Text className="text-xs text-slate-400 dark:text-slate-400 mb-3">
            Generate a code for your partner to connect!
          </Text>

          {generatedCode ? (
            <View className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl items-center mb-3 border border-slate-200 dark:border-slate-700">
              <Text className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                Your code:
              </Text>
              <Text className="text-2xl font-extrabold tracking-widest text-slate-800 dark:text-white">
                {generatedCode}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleGenerateCode}
            disabled={loading}
            className="bg-slate-800 dark:bg-sky-600 p-3 rounded-xl items-center justify-center flex-row"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white font-bold text-sm">
                Generate code ✨
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="bg-white dark:bg-slate-800 p-4 mb-4 rounded-2xl shadow-sm border border-transparent dark:border-slate-700">
          <Text className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
            Partner's code
          </Text>
          <Text className="text-xs text-slate-400 dark:text-slate-400 mb-3">
            Enter your partner's 6-digit code to connect!
          </Text>

          <TextInput
            className="border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl mb-3 text-base bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-center font-bold tracking-widest"
            placeholder="000000"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            maxLength={6}
            value={inputCode}
            onChangeText={setInputCode}
          />

          <TouchableOpacity
            onPress={handleConnect}
            disabled={loading || inputCode.length < 6}
            style={{
              backgroundColor:
                inputCode.length === 6
                  ? "#10b981"
                  : isDarkMode
                    ? "#334155"
                    : "#cbd5e1",
            }}
            className="p-3 rounded-xl items-center justify-center flex-row"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white font-bold text-sm">Connect 🔗</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-transparent dark:border-slate-700">
          <Text className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
            Credits
          </Text>
          <Text className="text-sm text-slate-400 dark:text-slate-400 mb-3">
            Made by Máté Auer ©️ MateDevs
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
