import { useSettings } from "@/context/settingsController";
import { BackendService, TorrentInfo } from "@/services/backendService"; // Figyelj az elérési útra!
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QBittorrentScreen() {
  const { theme } = useSettings();

  const [torrents, setTorrents] = useState<TorrentInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [magnetInput, setMagnetInput] = useState<string>("");
  const [adding, setAdding] = useState<boolean>(false);

  // Torrentek lekérése a backendről
  const fetchTorrents = async () => {
    try {
      const data = await BackendService.getTorrents();
      setTorrents(data);
    } catch (error) {
      console.error("Nem sikerült lekérni a torrenteket:", error);
    } finally {
      setLoading(false);
    }
  };

  // Élő frissítés 3 másodpercenként
  useEffect(() => {
    fetchTorrents();
    const interval = setInterval(fetchTorrents, 3000);
    return () => clearInterval(interval);
  }, []);

  // Globális sebességek számítása az aktív torrentekből
  const totalDlSpeed = torrents.reduce((acc, t) => acc + (t.dlspeed || 0), 0);
  const totalUpSpeed = torrents.reduce((acc, t) => acc + (t.upspeed || 0), 0);

  const formatSpeed = (bytesPerSec: number) => {
    if (!bytesPerSec || bytesPerSec === 0) return "0 KB/s";
    if (bytesPerSec > 1024 * 1024) {
      return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
    }
    return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 GB";
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Play / Pause váltás
  const handleToggleStatus = async (item: TorrentInfo) => {
    try {
      const isPaused = item.state.includes("paused");
      if (isPaused) {
        await BackendService.resumeTorrent(item.hash);
      } else {
        await BackendService.pauseTorrent(item.hash);
      }
      fetchTorrents();
    } catch (error) {
      Alert.alert("Hiba", "Nem sikerült módosítani a torrent állapotát.");
    }
  };

  // Törlés
  const handleDelete = (hash: string) => {
    Alert.alert("Torrent törlése", "Biztosan törölni szeretnéd?", [
      { text: "Mégse", style: "cancel" },
      {
        text: "Törlés",
        style: "destructive",
        onPress: async () => {
          try {
            await BackendService.deleteTorrent(hash, false);
            fetchTorrents();
          } catch (error) {
            Alert.alert("Hiba", "Nem sikerült törölni a torrentet.");
          }
        },
      },
    ]);
  };

  // Magnet link hozzáadása
  const handleAddTorrent = async () => {
    if (!magnetInput.trim()) return;
    try {
      setAdding(true);
      await BackendService.addTorrent(magnetInput.trim());
      setMagnetInput("");
      Alert.alert("Siker", "Torrent sikeresen hozzáadva!");
      fetchTorrents();
    } catch (error) {
      Alert.alert("Hiba", "Nem sikerült hozzáadni a magnet linket.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-900">
      <View className="flex-1 px-4 pt-2">
        <Text className="text-xl font-bold text-center mb-4 text-slate-800 dark:text-white">
          qBittorrent Manager
        </Text>

        {/* Magnet link hozzáadása input */}
        <View className="flex-row gap-2 mb-4">
          <TextInput
            className="flex-1 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs"
            placeholder="Paste magnet link here..."
            placeholderTextColor="#94a3b8"
            value={magnetInput}
            onChangeText={setMagnetInput}
          />
          <TouchableOpacity
            onPress={handleAddTorrent}
            disabled={adding}
            className="bg-emerald-500 px-4 py-2.5 rounded-xl justify-center items-center"
          >
            <Text className="text-xs font-bold text-white">
              {adding ? "Adding..." : "Add ➕"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Globális sebesség kártya */}
        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-4 border border-slate-200 dark:border-slate-700 shadow-sm flex-row justify-between">
          <View>
            <Text className="text-xs font-bold text-slate-400 uppercase">
              Global Download
            </Text>
            <Text className="text-lg font-bold text-emerald-500">
              ↓ {formatSpeed(totalDlSpeed)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs font-bold text-slate-400 uppercase">
              Global Upload
            </Text>
            <Text className="text-lg font-bold text-blue-500">
              ↑ {formatSpeed(totalUpSpeed)}
            </Text>
          </View>
        </View>

        <FlatList
          data={torrents}
          keyExtractor={(item) => item.hash}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const progressPercent = Math.round((item.progress || 0) * 100);
            const isCompleted = progressPercent === 100;
            const isPaused = item.state.includes("paused");

            return (
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
                      isCompleted
                        ? "text-blue-500"
                        : isPaused
                          ? "text-amber-500"
                          : "text-emerald-500"
                    }`}
                  >
                    {item.state}
                  </Text>
                </View>

                {/* Haladási csík (Progress Bar) */}
                <View className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden my-1">
                  <View
                    className={`h-full rounded-full ${
                      isCompleted
                        ? "bg-blue-500"
                        : isPaused
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </View>

                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-xs text-slate-500 dark:text-slate-400">
                    {formatSize(item.size)} • {progressPercent}%
                  </Text>

                  {!isPaused && (
                    <Text className="text-xs font-semibold text-emerald-500">
                      ↓ {formatSpeed(item.dlspeed)}
                    </Text>
                  )}

                  <Text className="text-xs text-slate-400">
                    ETA:{" "}
                    {item.eta > 0 ? `${Math.round(item.eta / 60)}m` : "Done"}
                  </Text>
                </View>

                {/* Gombok */}
                <View className="flex-row gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <TouchableOpacity
                    onPress={() => handleToggleStatus(item)}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 py-2 rounded-xl items-center"
                  >
                    <Text className="text-xs font-semibold text-slate-800 dark:text-white">
                      {isPaused ? "Resume" : "Pause"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(item.hash)}
                    className="flex-1 bg-rose-500/10 py-2 rounded-xl items-center"
                  >
                    <Text className="text-xs font-semibold text-rose-500">
                      Delete 🗑️
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
