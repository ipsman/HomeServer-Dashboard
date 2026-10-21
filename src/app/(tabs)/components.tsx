import { TaskManagerChart } from "@/components/TaskManagerChart";
import { useSettings } from "@/context/settingsController";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Components() {
  const { theme } = useSettings();

  // CPU Adatok
  const [cpuData, setCpuData] = useState([
    { value: 12 },
    { value: 18 },
    { value: 25 },
    { value: 15 },
    { value: 42 },
    { value: 38 },
    { value: 85 },
    { value: 60 },
    { value: 45 },
    { value: 30 },
    { value: 22 },
    { value: 35 },
  ]);

  // RAM Adatok (GB-ban kifejezve, pl. 16 GB-ból)
  const [ramUsage, setRamUsage] = useState(8.4);
  const totalRam = 16;

  // Hálózati Adatok (MB/s)
  const [netStats, setNetStats] = useState({ download: 12.4, upload: 2.1 });

  // Hőmérsékletek (°C)
  const [temps, setTemps] = useState({ cpu: 48, nvme: 39 });

  const [currentSpeed, setCurrentSpeed] = useState(2.4);

  // Szimulált valós idejű frissítés
  useEffect(() => {
    const interval = setInterval(() => {
      // CPU frissítés
      setCpuData((prev) => {
        const randomUsage = Math.floor(Math.random() * 60) + 15;
        return [...prev.slice(1), { value: randomUsage }];
      });

      // Órajel frissítés
      setCurrentSpeed(+(Math.random() * (3.5 - 2.1) + 2.1).toFixed(2));

      // RAM használat szimuláció (7.5 GB - 11.0 GB)
      setRamUsage(+(Math.random() * (11.0 - 7.5) + 7.5).toFixed(1));

      // Hálózati sebesség szimuláció
      setNetStats({
        download: +(Math.random() * 25 + 2).toFixed(1),
        upload: +(Math.random() * 5 + 0.5).toFixed(1),
      });

      // Hőmérséklet szimuláció
      setTemps({
        cpu: Math.floor(Math.random() * 15) + 42,
        nvme: Math.floor(Math.random() * 5) + 37,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const latestCpuValue = cpuData[cpuData.length - 1].value;
  const ramPercentage = Math.round((ramUsage / totalRam) * 100);

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-900">
      <ScrollView showsVerticalScrollIndicator={false} className="p-4">
        <Text className="text-xl font-bold text-center mb-4 text-slate-800 dark:text-white">
          System Analytics
        </Text>

        <View className="gap-4 pb-8">
          {/* 1. CPU Kártya & Grafikon */}
          <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <TaskManagerChart
              speed={currentSpeed}
              cpuUtilization={latestCpuValue}
              cpuData={cpuData}
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
                  6
                </Text>
                <Text className="text-sm font-bold text-slate-800 dark:text-white">
                  {currentSpeed} GHz
                </Text>
                <Text className="text-sm font-bold text-emerald-500">
                  {latestCpuValue}%
                </Text>
              </View>
            </View>
          </View>

          {/* 2. RAM (Memória) Kártya */}
          <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Text className="text-sm font-bold text-slate-800 dark:text-white mb-2">
              Memory (RAM)
            </Text>

            {/* Progress Bar sáv a RAM-nak */}
            <View className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden my-2">
              <View
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${ramPercentage}%` }}
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
                  {ramUsage} GB ({ramPercentage}%)
                </Text>
                <Text className="text-sm font-bold text-slate-800 dark:text-white">
                  {(totalRam - ramUsage).toFixed(1)} GB
                </Text>
                <Text className="text-sm font-bold text-slate-800 dark:text-white">
                  {totalRam} GB DDR4
                </Text>
              </View>
            </View>
          </View>

          {/* 3. Hálózati Sebesség & Hőmérsékletek (Kettős kártya) */}
          <View className="flex-row gap-3">
            {/* Hálózat */}
            <View className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm justify-between">
              <Text className="text-xs font-bold text-slate-400 uppercase mb-2">
                Network Speed
              </Text>

              <View className="gap-2">
                <View>
                  <Text className="text-[10px] text-slate-400">Download</Text>
                  <Text className="text-base font-bold text-emerald-500">
                    ↓ {netStats.download} MB/s
                  </Text>
                </View>
                <View>
                  <Text className="text-[10px] text-slate-400">Upload</Text>
                  <Text className="text-base font-bold text-blue-500">
                    ↑ {netStats.upload} MB/s
                  </Text>
                </View>
              </View>
            </View>

            {/* Hőmérsékletek */}
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
                    className={`text-base font-bold ${
                      temps.cpu > 70
                        ? "text-rose-500"
                        : "text-slate-800 dark:text-white"
                    }`}
                  >
                    🔥 {temps.cpu} °C
                  </Text>
                </View>
                <View>
                  <Text className="text-[10px] text-slate-400">NVMe SSD</Text>
                  <Text className="text-base font-bold text-slate-800 dark:text-white">
                    🌡️ {temps.nvme} °C
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
