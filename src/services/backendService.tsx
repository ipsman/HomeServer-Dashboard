const API_BASE_URL = '//192.168.0.115:8080/api'; // Android emulátorhoz (vagy a géped IP-címére)

// Definiáljuk, hogy milyen adatok jönnek a system végponttól (igazítsd a saját Backend DTO-d mezőihez!)
export interface SystemStats {
  cpuUsage?: number;
  freeMemory?: number;
  totalMemory?: number;
  // ide jöhetnek a többi OSHI-s adatok, amiket a backend küld
  [key: string]: any; 
}

export const BackendService = {
  // --- DOCKER ---
  async getContainers(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/docker/containers`);
    if (!response.ok) throw new Error('Nem sikerült lekérni a konténereket');
    return await response.json();
  },

  // --- SYSTEM STATS ---
  async getSystemStats(): Promise<SystemStats> {
    try {
      // Itt add meg a backendeden lévő system endpoint pontos útvonalát (pl. /system/stats vagy /system)
      const response = await fetch(`${API_BASE_URL}/system/stats`);
      if (!response.ok) {
        throw new Error(`Hiba történt: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Nem sikerült lekérni a rendszermutatókat:', error);
      throw error;
    }
  },
};