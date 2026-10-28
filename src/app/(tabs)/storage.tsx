import { CircularProgressBar } from "@/components/ProgressBar";
import { useSettings } from "@/context/settingsController";
import { useSystemStats } from "@/services/systemStats";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface DiskInfo {
  id: string;
  name: string;
  mountPoint: string;
  totalGB: number;
  usedGB: number;
  type: "SSD" | "HDD" | "NVMe";
}

export default function Storage() {
  const { appColor, theme } = useSettings();
  const isDarkMode = theme?.toLowerCase() === "dark";

  const { stats, loading, error } = useSystemStats(1000);

  // Dinamikusan feldolgozzuk a backendről jövő storage adatokat, ha vannak, különben fallback
  const disks: DiskInfo[] = stats?.storage && stats.storage.length > 0
    ? stats.storage.map((s, index) => ({
        id: String(index + 1),
        name: s.name || `Drive ${index + 1}`,
        mountPoint: s.mount || "/",
        totalGB: s.totalSpaceGB || 0,
        usedGB: s.usedSpaceGB || 0,
        type: (s.type as "SSD" | "HDD" | "NVMe") || "SSD",
      }))
    : [
        {
          id: "1",
          name: "System Drive",
          mountPoint: "/",
          totalGB: 512,
          usedGB: 128,
          type: "NVMe",
        },
        {
          id: "2",
          name: "Media Storage",
          mountPoint: "/mnt/media",
          totalGB: 2000,
          usedGB: 1400,
          type: "HDD",
        },
        {
          id: "3",
          name: "Backups & Logs",
          mountPoint: "/mnt/backups",
          totalGB: 1000,
          usedGB: 350,
          type: "SSD",
        },
      ];

  // Összesített értékek kiszámítása
  const totalCapacity = disks.reduce((acc, d) => acc + d.totalGB, 0);
  const totalUsed = disks.reduce((acc, d) => acc + d.usedGB, 0);
  const totalFree = totalCapacity - totalUsed;
  const overallProgress = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-900">
      <ScrollView showsVerticalScrollIndicator={false} className="p-4">
        <Text className="text-xl font-bold text-center mb-4 text-slate-800 dark:text-white">
          Storage Management
        </Text>

        {/* 1. Összesített Tárhely Kártya */}
        <View className="bg-white dark:bg-slate-800 p-5 rounded-2xl mb-4 shadow-sm border border-slate-200 dark:border-slate-700 items-center">
          <CircularProgressBar
            progress={overallProgress}
            showPercentage={true}
            size={170}
            label="Total Storage"
            color={appColor || (isDarkMode ? "#60a5fa" : "#2563eb")}
          />

          {/* Részletező adatsor */}
          <View className="mt-5 w-full border-t border-slate-200 dark:border-slate-700 pt-4 flex-row justify-between">
            <View className="gap-1.5">
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total capacity:
              </Text>
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Used space:
              </Text>
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Free space:
              </Text>
            </View>

            <View className="gap-1.5 items-end">
              <Text className="text-xs font-bold text-slate-800 dark:text-white">
                {(totalCapacity / 1024).toFixed(2)} TB ({totalCapacity.toFixed(0)} GB)
              </Text>
              <Text className="text-xs font-bold text-blue-500">
                {(totalUsed / 1024).toFixed(2)} TB ({totalUsed.toFixed(0)} GB)
              </Text>
              <Text className="text-xs font-bold text-emerald-500">
                {(totalFree / 1024).toFixed(2)} TB ({totalFree.toFixed(0)} GB)
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Egyedi Meghajtók / Lemezek Listája */}
        <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
          Mounted Disks & Partitions ({disks.length})
        </Text>

        <View className="gap-3 pb-8">
          {disks.map((disk) => {
            const diskProgress = disk.totalGB > 0 ? Math.round((disk.usedGB / disk.totalGB) * 100) : 0;
            const diskFreeGB = disk.totalGB - disk.usedGB; // <--- Javítva (- jel)

            return (
              <View
                key={disk.id}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                {/* Lemez Fejléc */}
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-bold text-slate-800 dark:text-white text-base">
                      {disk.name}
                    </Text>
                    <View className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                      <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-300">
                        {disk.type}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {disk.mountPoint}
                  </Text>
                </View>

                {/* Sima Progress Bar sáv a lemezhez */}
                <View className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden my-2">
                  <View
                    className={`h-full rounded-full ${
                      diskProgress > 85 ? "bg-rose-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${diskProgress}%` }}
                  />
                </View>

                {/* Lemez adatai */}
                <View className="flex-row justify-between items-center mt-1">
                  <Text className="text-xs text-slate-500 dark:text-slate-400">
                    {disk.usedGB.toFixed(0)} GB used of {disk.totalGB.toFixed(0)} GB
                  </Text>
                  <Text className="text-xs font-bold text-slate-800 dark:text-white">
                    {diskFreeGB.toFixed(0)} GB free ({100 - diskProgress}%) {/* <--- Javítva (- jel) */}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}