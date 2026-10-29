import { TaskManagerChart } from "@/components/TaskManagerChart";
import { useSettings } from "@/context/settingsController";
import { useSystemStats } from "@/services/systemStats";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Components() {
  const { theme } = useSettings();

  const { stats, loading, error } = useSystemStats(1000);

  const [cpuData, setCpuData] = useState<number[]>([]);

  useEffect(() => {
    // Lokális változóba mentjük, így a TypeScript már biztos benne, hogy ez szám
    const currentCpu = stats?.cpuUsagePercent;

    if (currentCpu !== undefined) {
      setCpuData((prevData) => {
        const newData = [...prevData, currentCpu];
        if (newData.length > 30) {
          newData.shift(); // Eltávolítjuk a legrégebbit
        }
        return newData;
      });
    }
  }, [stats?.cpuUsagePercent]);

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-900">
      <ScrollView showsVerticalScrollIndicator={false} className="p-4">
        <Text className="text-xl font-bold text-center mb-4 text-slate-800 dark:text-white">
          System Analytics
        </Text>

        <View className="gap-4 pb-8">
          <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <TaskManagerChart
              speed={stats?.cpuCurrentFreqGHz || 0}
              cpuUtilization={stats?.cpuUsagePercent?.toFixed(0) || ""}
              cpuData={cpuData.map((val) => ({ value: val }))}
            />

            <View className="mt-4 flex-row justify-between border-t border-slate-200 dark:border-slate-700 pt-4">
              <View className="flex gap-2">
                <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Cores:
                </Text>
                <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Speed:
                </Text>
                <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Utilization:
                </Text>
              </View>

              <View className="flex gap-2 items-end">
                <Text className="text-sm font-bold text-slate-800 dark:text-white">
                  {stats?.cpuCores}
                </Text>
                <Text className="text-sm font-bold text-slate-800 dark:text-white">
                  {stats?.cpuCurrentFreqGHz} GHz
                </Text>
                <Text className="text-sm font-bold text-emerald-500">
                  {stats?.cpuUsagePercent?.toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Text className="text-sm font-bold text-slate-800 dark:text-white mb-2">
              Memory (RAM)
            </Text>

            <View className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden my-2">
              <View
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${Math.min(stats?.memoryUsagePercent || 0, 100)}%`,
                }}
              />
            </View>

            <View className="mt-2 flex-row justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
              <View className="flex gap-1.5">
                <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  In use:
                </Text>
                <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Available:
                </Text>
                <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Total Hardware:
                </Text>
              </View>

              <View className="flex gap-1.5 items-end">
                <Text className="text-sm font-bold text-blue-500">
                  {((stats?.totalMemoryMB || 0) / 1024).toFixed(0)} GB (
                  {stats?.memoryUsagePercent?.toFixed(0)}%)
                </Text>
                <Text className="text-sm font-bold text-slate-800 dark:text-white">
                  {((stats?.availableMemoryMB ?? 0) / 1024).toFixed(0)} GB
                </Text>
                <Text className="text-sm font-bold text-slate-800 dark:text-white">
                  {((stats?.totalMemoryMB ?? 0) / 1024).toFixed(0)} GB
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm justify-between">
              <Text className="text-xs font-bold text-slate-400 uppercase mb-2">
                Network Speed
              </Text>
              <View className="gap-2">
                <View>
                  <Text className="text-[10px] text-slate-400">Download</Text>
                  <Text className="text-base font-bold text-emerald-500">
                    ↓ {((stats?.downloadSpeedKBps ?? 0) / 1024).toFixed(2)} MB/s
                  </Text>
                </View>
                <View>
                  <Text className="text-[10px] text-slate-400">Upload</Text>
                  <Text className="text-base font-bold text-blue-500">
                    ↑ {((stats?.uploadSpeedKBps ?? 0) / 1024).toFixed(2)} MB/s
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm justify-between">
              <Text className="text-xs font-bold text-slate-400 uppercase mb-2">
                Temperatures
              </Text>
              <View className="gap-2">
                <View>
                  <Text className="text-[10px] text-slate-400">
                    CPU Package
                  </Text>
                  <Text
                    className={`text-base font-bold ${stats?.cpuTemp || 0 > 70 ? "text-rose-500" : "text-slate-800 dark:text-white"}`}
                  >
                    {stats?.cpuTemp} °C
                  </Text>
                </View>
                <View>
                  <Text className="text-[10px] text-slate-400">NVMe SSD</Text>
                  <Text className="text-base font-bold text-slate-800 dark:text-white">
                    {stats?.cpuTemp} °C
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
