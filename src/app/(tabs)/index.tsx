import { CircularProgressBar } from "@/components/ProgressBar";
import { useSettings } from "@/context/settingsController";
import { BackendService, ContainerInfo } from "@/services/backendService";
import { useSystemStats } from "@/services/systemStats";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ServiceItem {
  name: string;
  status: "online" | "offline";
}

export default function HomeScreen() {
  const { appColor, theme } = useSettings();
  const isDarkMode = theme?.toLowerCase() === "dark";
  const { stats, loading, error } = useSystemStats(1000);
  
  const [services, setServices] = useState<ServiceItem[]>([
    { name: "Jellyfin", status: "offline" },
    { name: "Samba", status: "offline" },
    { name: "Tailscale", status: "offline" },
    { name: "Qbittorrent", status: "offline" },
    { name: "Docker", status: "offline" },
  ]);

  // Valós konténerek lekérése a BackendService-en keresztül
  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const data = await BackendService.getContainers();
        
        // Átalakítjuk a backend válaszát a HomeScreen kis kártyáira
        const formatted: ServiceItem[] = data.map((container: ContainerInfo) => ({
          name: container.name.replace("/", ""),
          status: container.state === "running" ? "online" : "offline",
        }));

        if (formatted.length > 0) {
          setServices(formatted);
        }
      } catch (err) {
        console.error("Hiba a HomeScreen konténer lekérésénél:", err);
      }
    };

    fetchContainers();
    const interval = setInterval(fetchContainers, 3000); // 3mp-enként frissül
    return () => clearInterval(interval);
  }, []);

  const onlineCount = services.filter((s) => s.status === "online").length;

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="flex-1 bg-slate-100 dark:bg-slate-900"
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-5 pt-2 pb-6">
          <Text className="text-xl font-bold text-center mb-4 text-slate-800 dark:text-white">
            Overview
          </Text>

          {/* 1. Kiemelt Terhelési Kártya */}
          <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-4 shadow-sm border border-slate-200 dark:border-slate-700 items-center">
            <CircularProgressBar
              progress={stats?.totalSystemUsagePercent || 0}
              showPercentage={true}
              size={170}
              label="Total Usage"
              color={appColor || (isDarkMode ? "#60a5fa" : "#2563eb")}
            />

            {/* Részletes mutatók */}
            <View className="mt-4 w-full flex-row justify-between border-t border-slate-200 dark:border-slate-700/80 pt-3">
              <View className="gap-1.5">
                <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  CPU usage:
                </Text>
                <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Memory usage:
                </Text>
                <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Storage usage:
                </Text>
                <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Network usage:
                </Text>
              </View>
              <View className="gap-1.5 items-end">
                <Text className="text-xs font-bold text-slate-800 dark:text-white">
                  {stats?.cpuUsagePercent?.toFixed(0)}%
                </Text>
                <Text className="text-xs font-bold text-slate-800 dark:text-white">
                  {stats?.memoryUsagePercent?.toFixed(0)}%
                </Text>
                <Text className="text-xs font-bold text-slate-800 dark:text-white">
                  {stats?.storage?.[0]?.usagePercent?.toFixed(0) ?? 0}%
                </Text>
                <Text className="text-xs font-bold text-slate-800 dark:text-white">
                  {stats?.networkUsagePercent?.toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>

          {/* 2. Szerver Állapot Kártya */}
          <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-4 shadow-sm border border-slate-200 dark:border-slate-700 flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <View className="w-3 h-3 rounded-full bg-emerald-500" />
              <View>
                <Text className="font-bold text-slate-800 dark:text-white">
                  {stats?.Hostname || "HomeServer"}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  {stats?.osName?.substring(0, 19) || "Linux / Windows"}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-xs font-bold text-emerald-500">ONLINE</Text>
              <Text className="text-[10px] text-slate-400">Uptime: {stats?.uptimeFormatted}</Text>
            </View>
          </View>

          {/* 3. Szolgáltatások / Docker Grid */}
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-2.5">
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Services ({onlineCount}/{services.length} Online)
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {services.map((service, index) => (
                <View
                  key={index}
                  className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex-1 min-w-[45%] flex-row items-center justify-between shadow-sm"
                >
                  <Text className="font-semibold text-slate-800 dark:text-white text-sm">
                    {service.name}
                  </Text>
                  <View
                    className={`w-2.5 h-2.5 rounded-full ${
                      service.status === "online"
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                  />
                </View>
              ))}
            </View>

            <View className="flex-row gap-3 mb-4 mt-4">
              <View className="flex-1 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex-row items-center justify-between shadow-sm">
                <View>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase">
                    Download
                  </Text>
                  <Text className="text-base font-bold text-slate-800 dark:text-white">
                    {(((stats?.downloadSpeedKBps ?? 0) / 1024)).toFixed(2)} MB/s
                  </Text>
                </View>
                <View className="w-8 h-8 rounded-full bg-blue-500/10 items-center justify-center">
                  <Text className="text-blue-500 font-bold text-xs">↓</Text>
                </View>
              </View>

              <View className="flex-1 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex-row items-center justify-between shadow-sm">
                <View>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase">
                    Upload
                  </Text>
                  <Text className="text-base font-bold text-slate-800 dark:text-white">
                    {(((stats?.uploadSpeedKBps ?? 0) / 1024)).toFixed(2)} MB/s
                  </Text>
                </View>
                <View className="w-8 h-8 rounded-full bg-emerald-500/10 items-center justify-center">
                  <Text className="text-emerald-500 font-bold text-xs">↑</Text>
                </View>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Quick Actions
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 items-center active:opacity-70 shadow-sm">
                  <Text className="text-xs font-semibold text-slate-800 dark:text-white">
                    🔄 Reboot Docker
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 items-center active:opacity-70 shadow-sm">
                  <Text className="text-xs font-semibold text-slate-800 dark:text-white">
                    🧹 Clear Cache
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}