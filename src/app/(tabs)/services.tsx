import { useSettings } from "@/context/settingsController";
import { BackendService, ContainerInfo } from "@/services/backendService"; // 👈 Beimportáljuk a szolgáltatást
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ServiceItem {
  id: string;
  name: string;
  status: "online" | "offline";
  port?: number;
  image?: string;
  screenRoute?: string; 
}

export default function ServicesScreen() {
  const { theme } = useSettings();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Valós adatok lekérése a BackendService-en keresztül
  const fetchContainers = async () => {
    try {
      const data = await BackendService.getContainers();

      // Átalakítjuk a backend válaszát a ServiceItem formátumra
      const formattedServices: ServiceItem[] = data.map((container: ContainerInfo) => {
        const isRunning = container.state === "running";
        const containerName = container.name.replace("/", ""); // Docker gyakran tesz egy /-t a név elé

        let screenRoute;
        let port;
        if (containerName.toLowerCase().includes("qbittorrent")) {
          screenRoute = "/qbittorrent";
          port = 8080;
        } else if (containerName.toLowerCase().includes("jellyfin")) {
          port = 8096;
        }

        return {
          id: container.id,
          name: containerName,
          image: container.image,
          status: isRunning ? "online" : "offline",
          port: port,
          screenRoute: screenRoute,
        };
      });

      setServices(formattedServices);
    } catch (err) {
      console.error("Hiba a szolgáltatások lekérésekor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 3000); // 3mp-enkénti frissítés
    return () => clearInterval(interval);
  }, []);

  // Konténer Indítása / Leállítása a backenden keresztül
  const toggleServiceStatus = async (id: string, currentStatus: string) => {
    const isOnline = currentStatus === "online";
    
    try {
      if (isOnline) {
        await BackendService.stopContainer(id);
      } else {
        await BackendService.startContainer(id);
      }
      
      // Azonnali UI frissítés sikeres hívás után
      setServices((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: isOnline ? "offline" : "online" } : s
        )
      );
    } catch (err) {
      console.error("Hiba a művelet végrehajtásakor:", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-900">
      <ScrollView showsVerticalScrollIndicator={false} className="p-4">
        <Text className="text-xl font-bold text-slate-800 dark:text-white mb-4">
          Services & Containers ({services.length})
        </Text>

        {loading && services.length === 0 ? (
          <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
        ) : (
          <View className="gap-3 pb-8">
            {services.map((service) => (
              <View
                key={service.id}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                {/* Fejléc: Név + Status indicator */}
                <View className="flex-row items-center justify-between mb-2">
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

                {/* Docker Image kiírása alatta */}
                {service.image && (
                  <Text className="text-[11px] font-mono text-slate-400 mb-3">
                    {service.image}
                  </Text>
                )}

                {/* Külön gomb appon belüli nézethez (ha van screenRoute) */}
                {service.screenRoute && (
                  <TouchableOpacity
                    onPress={() => router.push(service.screenRoute as any)}
                    className="bg-blue-600/10 dark:bg-blue-500/20 py-2.5 px-3 rounded-xl items-center mb-3 flex-row justify-center gap-2 border border-blue-500/30 active:opacity-70"
                  >
                    <Text className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      Kezelő Megnyitása 📥
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Akciógombok sora */}
                <View className="flex-row gap-2 border-t border-slate-100 dark:border-slate-700/60 pt-3">
                  <TouchableOpacity
                    onPress={() => toggleServiceStatus(service.id, service.status)}
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

                  <TouchableOpacity onPress={() => BackendService.restartContainer(service.id)} className="flex-1 bg-slate-100 dark:bg-slate-700 py-2 px-3 rounded-xl items-center active:opacity-70">
                    <Text className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Restart
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-1 bg-slate-100 dark:bg-slate-700 py-2 px-3 rounded-xl items-center active:opacity-70">
                    <Text className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Logs
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}