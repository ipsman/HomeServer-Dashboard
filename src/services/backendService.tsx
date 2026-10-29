import AsyncStorage from "@react-native-async-storage/async-storage";

let customServerIp = "192.168.0.115:8080"; // Alapértelmezett

// Inicializáláskor betöltjük a mentett címet
AsyncStorage.getItem("serverUrl").then((saved) => {
  if (saved) {
    customServerIp = saved.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
});

export const setServerIp = async (ip: string) => {
  const cleanedIp = ip.replace(/^https?:\/\//, "").replace(/\/$/, "");
  customServerIp = cleanedIp;
  await AsyncStorage.setItem("serverUrl", cleanedIp);
};

const getApiBaseUrl = () => {
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
    // Mivel a SystemController /api/system/containers alatt adja vissza
    const response = await fetch(`${getApiBaseUrl()}/docker/containers`);
    if (!response.ok) throw new Error("Nem sikerült lekérni a konténereket");
    return await response.json();
  },

  async startContainer(id: string): Promise<void> {
    const response = await fetch(
      `${getApiBaseUrl()}/docker/container/${id}/start`,
      {
        method: "POST",
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend hiba start közben:", errorText);
      throw new Error(
        `Nem sikerült elindítani a konténert (Státusz: ${response.status})`,
      );
    }
  },

  async stopContainer(id: string): Promise<void> {
    const response = await fetch(
      `${getApiBaseUrl()}/docker/container/${id}/stop`,
      {
        method: "POST",
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend hiba stop közben:", errorText);
      throw new Error(
        `Nem sikerült leállítani a konténert (Státusz: ${response.status})`,
      );
    }
  },

  async restartContainer(id: string): Promise<void> {
    const response = await fetch(
      `${getApiBaseUrl()}/docker/container/${id}/restart`,
      {
        method: "POST",
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend hiba stop közben:", errorText);
      throw new Error(
        `Nem sikerült leállítani a konténert (Státusz: ${response.status})`,
      );
    }
  },

  // --- SYSTEM STATS ---
  async getSystemStats(): Promise<SystemStats> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/system/stats`);
      if (!response.ok) {
        throw new Error(`Hiba történt: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Nem sikerült lekérni a rendszermutatókat:", error);
      throw error;
    }
  },

  async getTorrents(): Promise<TorrentInfo[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/torrents`);
      if (!response.ok) throw new Error("Nem sikerült lekérni a torrenteket");
      return await response.json();
    } catch (error) {
      console.error("Hiba a torrentek lekérésekor:", error);
      throw error;
    }
  },

  async addTorrent(magnet: string): Promise<void> {
    const response = await fetch(`${getApiBaseUrl()}/torrents/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ magnet }),
    });
    if (!response.ok) throw new Error("Nem sikerült hozzáadni a torrentet");
  },

  async pauseTorrent(hash: string): Promise<void> {
    const response = await fetch(`${getApiBaseUrl()}/torrents/${hash}/pause`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Nem sikerült megállítani a torrentet");
  },

  async resumeTorrent(hash: string): Promise<void> {
    const response = await fetch(`${getApiBaseUrl()}/torrents/${hash}/resume`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Nem sikerült elindítani a torrentet");
  },

  async deleteTorrent(
    hash: string,
    deleteFiles: boolean = false,
  ): Promise<void> {
    const response = await fetch(
      `${getApiBaseUrl()}/torrents/${hash}?deleteFiles=${deleteFiles}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Nem sikerült törölni a torrentet");
  },
};
