import { CircularProgressBar } from "@/components/ProgressBar";
import { useSettings } from "@/context/settingsController";
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

  // Mock adatok a szerver merevlemezeiről
  const disks: DiskInfo[] = [
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
  const overallProgress = Math.round((totalUsed / totalCapacity) * 100);

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
                {(totalCapacity / 1024).toFixed(2)} TB ({totalCapacity} GB)
              </Text>
              <Text className="text-xs font-bold text-blue-500">
                {(totalUsed / 1024).toFixed(2)} TB ({totalUsed} GB)
              </Text>
              <Text className="text-xs font-bold text-emerald-500">
                {(totalFree / 1024).toFixed(2)} TB ({totalFree} GB)
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
            const diskProgress = Math.round((disk.usedGB / disk.totalGB) * 100);
            const diskFreeGB = disk.totalGB - disk.usedGB;

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
                    {disk.usedGB} GB used of {disk.totalGB} GB
                  </Text>
                  <Text className="text-xs font-bold text-slate-800 dark:text-white">
                    {diskFreeGB} GB free ({100 - diskProgress}%)
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
