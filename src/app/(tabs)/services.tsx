import { useSettings } from "@/context/settingsController";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ServiceItem {
  id: string;
  name: string;
  status: "online" | "offline";
  port?: number;
  screenRoute?: string; // Appon belüli útvonal (ha van saját nézete)
}

export default function ServicesScreen() {
  const { theme } = useSettings();

  const [services, setServices] = useState<ServiceItem[]>([
    { id: "1", name: "Jellyfin", status: "online", port: 8096 },
    { id: "2", name: "Samba", status: "online", port: 445 },
    { id: "3", name: "Tailscale", status: "online" },
    {
      id: "4",
      name: "Qbittorrent",
      status: "online",
      port: 8080,
      screenRoute: "/qbittorrent", // 👈 A qBittorrent képernyőd útvonala
    },
    { id: "5", name: "Docker Daemon", status: "offline" },
  ]);

  const toggleServiceStatus = (id: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "online" ? "offline" : "online" }
          : s,
      ),
    );
  };

  const handleOpenTorrentScreen = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-900">
      <ScrollView showsVerticalScrollIndicator={false} className="p-4">
        <Text className="text-xl font-bold text-slate-800 dark:text-white mb-4">
          Services & Containers
        </Text>

        <View className="gap-3 pb-8">
          {services.map((service) => (
            <View
              key={service.id}
              className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              {/* Fejléc: Név + Status indicator */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <Text className="font-bold text-slate-800 dark:text-white text-base">
                    {service.name}
                  </Text>
                  {service.port && (
                    <Text className="text-xs text-slate-400">
                      :{service.port}
                    </Text>
                  )}
                </View>

                <View className="flex-row items-center gap-2">
                  <Text
                    className={`text-xs font-semibold uppercase ${
                      service.status === "online"
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}
                  >
                    {service.status}
                  </Text>
                  <View
                    className={`w-2.5 h-2.5 rounded-full ${
                      service.status === "online"
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                  />
                </View>
              </View>

              {/* 🚀 Külön gomb a Torrent Screen megnyitásához (ha van screenRoute) */}
              {service.screenRoute && (
                <TouchableOpacity
                  onPress={() => handleOpenTorrentScreen(service.screenRoute!)}
                  className="bg-blue-600/10 dark:bg-blue-500/20 py-2.5 px-3 rounded-xl items-center mb-3 flex-row justify-center gap-2 border border-blue-500/30 active:opacity-70"
                >
                  <Text className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Torrent Kezelő Megnyitása 📥
                  </Text>
                </TouchableOpacity>
              )}

              {/* Akciógombok sora */}
              <View className="flex-row gap-2 border-t border-slate-100 dark:border-slate-700/60 pt-3">
                {/* Start / Stop Toggle */}
                <TouchableOpacity
                  onPress={() => toggleServiceStatus(service.id)}
                  className={`flex-1 py-2 px-3 rounded-xl items-center ${
                    service.status === "online"
                      ? "bg-rose-500/10 dark:bg-rose-500/20"
                      : "bg-emerald-500/10 dark:bg-emerald-500/20"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      service.status === "online"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {service.status === "online" ? "Stop" : "Start"}
                  </Text>
                </TouchableOpacity>

                {/* Restart */}
                <TouchableOpacity className="flex-1 bg-slate-100 dark:bg-slate-700 py-2 px-3 rounded-xl items-center active:opacity-70">
                  <Text className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Restart
                  </Text>
                </TouchableOpacity>

                {/* Logs */}
                <TouchableOpacity className="flex-1 bg-slate-100 dark:bg-slate-700 py-2 px-3 rounded-xl items-center active:opacity-70">
                  <Text className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Logs
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
