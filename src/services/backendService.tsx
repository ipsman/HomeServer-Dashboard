import AsyncStorage from "@react-native-async-storage/async-storage";

let customServerIp = "homeserver.tail002065.ts.net:8081"; // Alapértelmezett fallback
let isInitialized = false;

// Biztosítjuk, hogy a hívások előtt betöltődjön a mentett IP
const ensureInitialized = async () => {
  if (isInitialized) return;
  try {
    const saved = await AsyncStorage.getItem("serverUrl");
    if (saved) {
      customServerIp = saved.replace(/^https?:\/\//, "").replace(/\/$/, "");
    }
  } catch (e) {
    console.error(
      "Nem sikerült betölteni a szerver URL-t az AsyncStorage-ból:",

      e,
      alert("Hiba: " + JSON.stringify(e)),
    );
  } finally {
    isInitialized = true; // Akkor is jelezzük, hogy lefutott, hahiba volt, hogy ne akassza meg az appot
  }
};

export const setServerIp = async (ip: string) => {
  const cleanedIp = ip.replace(/^https?:\/\//, "").replace(/\/$/, "");
  customServerIp = cleanedIp;
  isInitialized = true;
  await AsyncStorage.setItem("serverUrl", cleanedIp);
};

const getApiBaseUrl = async () => {
  await ensureInitialized();
  return `http://${customServerIp}/api`;
};

export interface SystemStats {
  cpuUsagePercent?: number;
  totalMemoryMB?: number;
  usedMemoryMB?: number;
  availableMemoryMB?: number;
  memoryUsagePercent?: number;
  osName?: string;
  uptimeFormatted?: string;
  uptimeDays?: number;
  cpuTemp?: number;
  cpuCores?: number;
  storage?: Array<{
    name: string;
    mount: string;
    type: string;
    totalSpaceGB: number;
    usableSpaceGB: number;
    usedSpaceGB: number;
    usagePercent: number;
  }>;
  downloadSpeedKBps?: number;
  uploadSpeedKBps?: number;
  Hostname?: string;
  cpuCurrentFreqGHz?: number;
  cpuMaxFreqGHz?: number;
  networkUsagePercent?: number;
  totalSystemUsagePercent?: number;
  [key: string]: any;
}

export interface TorrentInfo {
  hash: string;
  name: string;
  size: number;
  progress: number;
  dlspeed: number;
  upspeed: number;
  state: string;
  eta: number;
  [key: string]: any;
}

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: "running" | "exited" | "restarting" | string;
}

export const BackendService = {
  // --- DOCKER ---
  async getContainers(): Promise<ContainerInfo[]> {
    const baseUrl = await getApiBaseUrl();
    const response = await fetch(`${baseUrl}/docker/containers`);
    if (!response.ok) throw new Error("Nem sikerült lekérni a konténereket");
    return await response.json();
  },

  async startContainer(id: string): Promise<void> {
    const baseUrl = await getApiBaseUrl();
    const response = await fetch(`${baseUrl}/docker/container/${id}/start`, {
      method: "POST",
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend hiba start közben:", errorText);
      throw new Error(
        `Nem sikerült elindítani a konténert (Státusz: ${response.status})`,
      );
    }
  },

  async stopContainer(id: string): Promise<void> {
    const baseUrl = await getApiBaseUrl();
    const response = await fetch(`${baseUrl}/docker/container/${id}/stop`, {
      method: "POST",
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend hiba stop közben:", errorText);
      throw new Error(
        `Nem sikerült leállítani a konténert (Státusz: ${response.status})`,
      );
    }
  },

  async restartContainer(id: string): Promise<void> {
    const baseUrl = await getApiBaseUrl();
    const response = await fetch(`${baseUrl}/docker/container/${id}/restart`, {
      method: "POST",
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend hiba restart közben:", errorText);
      throw new Error(
        `Nem sikerült újraindítani a konténert (Státusz: ${response.status})`,
      );
    }
  },

  // --- SYSTEM STATS ---
  async getSystemStats(): Promise<SystemStats> {
    try {
      const baseUrl = await getApiBaseUrl();
      const response = await fetch(`${baseUrl}/system/stats`);
      if (!response.ok) {
        throw new Error(`Hiba történt: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Nem sikerült lekérni a rendszermutatókat:", error);
      alert("Hiba: " + JSON.stringify(error));
      throw error;
    }
  },

  async getTorrents(): Promise<TorrentInfo[]> {
    try {
      const baseUrl = await getApiBaseUrl();
      const response = await fetch(`${baseUrl}/torrents`);
      if (!response.ok) throw new Error("Nem sikerült lekérni a torrenteket");
      return await response.json();
    } catch (error) {
      console.error("Hiba a torrentek lekérésekor:", error);
      throw error;
    }
  },

  async addTorrent(magnet: string): Promise<void> {
    const baseUrl = await getApiBaseUrl();
    const response = await fetch(`${baseUrl}/torrents/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ magnet }),
    });
    if (!response.ok) throw new Error("Nem sikerült hozzáadni a torrentet");
  },

  async pauseTorrent(hash: string): Promise<void> {
    const baseUrl = await getApiBaseUrl();
    const response = await fetch(`${baseUrl}/torrents/${hash}/pause`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Nem sikerült megállítani a torrentet");
  },

  async resumeTorrent(hash: string): Promise<void> {
    const baseUrl = await getApiBaseUrl();
    const response = await fetch(`${baseUrl}/torrents/${hash}/resume`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Nem sikerült elindítani a torrentet");
  },

  async deleteTorrent(
    hash: string,
    deleteFiles: boolean = false,
  ): Promise<void> {
    const baseUrl = await getApiBaseUrl();
    const response = await fetch(
      `${baseUrl}/torrents/${hash}?deleteFiles=${deleteFiles}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Nem sikerült törölni a torrentet");
  },
};
