import React from "react";
import { Platform, Text, View } from "react-native";

let LineChart: any = null;
if (Platform.OS !== "web") {
  LineChart = require("react-native-gifted-charts").LineChart;
}

interface TaskManagerChartProps {
  speed: number;
  cpuUtilization: number;
  cpuData: { value: number }[];
}

export const TaskManagerChart: React.FC<TaskManagerChartProps> = ({
  speed,
  cpuUtilization,
  cpuData,
}) => {
  return (
    <View className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
      <View className="flex-row justify-between items-end mb-2 border-b border-slate-800 pb-2">
        <View>
          <Text className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            CPU
          </Text>
          <Text className="text-[10px] text-slate-400">
            {speed} GHz — 60 másodperc
          </Text>
        </View>
        <Text className="text-xl font-black text-emerald-400">
          {cpuUtilization}%
        </Text>
      </View>

      {Platform.OS === "web" ? (
        <View className="h-32 justify-center items-center">
          <Text className="text-slate-400 text-xs">
            📊 Grafikon mobilon érhető el
          </Text>
        </View>
      ) : (
        LineChart && (
          <LineChart
            data={cpuData}
            height={120}
            color="#10b981"
            thickness={2}
            areaChart
            startOpacity={0.25}
            endOpacity={0.02}
            startFillColor="#10b981"
            endFillColor="#10b981"
            noOfSections={4}
            maxValue={100}
            rulesType="solid"
            rulesColor="#1e293b"
            yAxisTextStyle={{ color: "#64748b", fontSize: 9 }}
            yAxisColor="transparent"
            xAxisColor="transparent"
            initialSpacing={0}
            spacing={22}
            dataPointsColor={"transparent"}
          />
        )
      )}
    </View>
  );
};
