import { useSettings } from "@/context/settingsController";
import { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TorrentItem {
  id: string;
  name: string;
  size: string;
  progress: number;
  downloadSpeed: string;
  uploadSpeed: string;
  status: "downloading" | "paused" | "completed";
  eta: string;
}

export default function QBittorrentScreen() {
  const { theme } = useSettings();

  const [torrents, setTorrents] = useState<TorrentItem[]>([
    {
      id: "1",
      name: "Ubuntu-24.04-desktop-amd64.iso",
      size: "5.8 GB",
      progress: 72,
      downloadSpeed: "14.2 MB/s",
      uploadSpeed: "1.1 MB/s",
      status: "downloading",
      eta: "3m 12s",
    },
    {
      id: "2",
      name: "Debian-12.5.0-netinst.iso",
      size: "640 MB",
      progress: 100,
      downloadSpeed: "0 KB/s",
      uploadSpeed: "250 KB/s",
      status: "completed",
      eta: "Done",
    },
    {
      id: "3",
      name: "ArchLinux-2026.10-x86_64.iso",
      size: "1.1 GB",
      progress: 45,
      downloadSpeed: "0 KB/s",
      uploadSpeed: "0 KB/s",
      status: "paused",
      eta: "Paused",
    },
  ]);

  const toggleTorrentStatus = (id: string) => {
    setTorrents((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus =
            t.status === "downloading" ? "paused" : "downloading";
          return { ...t, status: nextStatus };
        }
        return t;
      }),
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-900">
      <View className="flex-1 px-4 pt-2">
        <Text className="text-xl font-bold text-center mb-4 text-slate-800 dark:text-white">
          qBittorrent Manager
        </Text>

        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-4 border border-slate-200 dark:border-slate-700 shadow-sm flex-row justify-between">
          <View>
            <Text className="text-xs font-bold text-slate-400 uppercase">
              Global Download
            </Text>
            <Text className="text-lg font-bold text-emerald-500">
              ↓ 14.2 MB/s
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs font-bold text-slate-400 uppercase">
              Global Upload
            </Text>
            <Text className="text-lg font-bold text-blue-500">↑ 1.35 MB/s</Text>
          </View>
        </View>

        <FlatList
          data={torrents}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-200 dark:border-slate-700 shadow-sm">
              {/* Torrent neve és Állapota */}
              <View className="flex-row justify-between items-start mb-2">
                <Text
                  className="font-bold text-slate-800 dark:text-white text-sm flex-1 mr-2"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text
                  className={`text-xs font-bold uppercase ${
                    item.status === "downloading"
                      ? "text-emerald-500"
                      : item.status === "completed"
                        ? "text-blue-500"
                        : "text-amber-500"
                  }`}
                >
                  {item.status}
                </Text>
              </View>

              {/* Haladási csík (Progress Bar) */}
              <View className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden my-1">
                <View
                  className={`h-full rounded-full ${
                    item.status === "completed"
                      ? "bg-blue-500"
                      : item.status === "paused"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </View>

              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  {item.size} • {item.progress}%
                </Text>

                {item.status === "downloading" && (
                  <Text className="text-xs font-semibold text-emerald-500">
                    ↓ {item.downloadSpeed}
                  </Text>
                )}

                <Text className="text-xs text-slate-400">ETA: {item.eta}</Text>
              </View>

              <View className="flex-row gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <TouchableOpacity
                  onPress={() => toggleTorrentStatus(item.id)}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 py-2 rounded-xl items-center"
                >
                  <Text className="text-xs font-semibold text-slate-800 dark:text-white">
                    {item.status === "downloading" ? "Pause ⏸️" : "Resume ▶️"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-1 bg-rose-500/10 py-2 rounded-xl items-center">
                  <Text className="text-xs font-semibold text-rose-500">
                    Delete 🗑️
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
