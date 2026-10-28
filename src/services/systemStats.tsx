import { useEffect, useState } from "react";
import { BackendService, SystemStats } from "./backendService"; // Ide irányítsd a saját service-edre

export function useSystemStats(intervalMs = 3000) {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await BackendService.getSystemStats();
        if (isMounted) {
          setStats(data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Hiba történt a adatok lekérésekor");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Első azonnali lekérés
    fetchData();

    // Időzítő az élő frissítéshez (Polling)
    const interval = setInterval(fetchData, intervalMs);

    // Takarítás, ha elhagyjuk a komponenst
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [intervalMs]);

  return { stats, loading, error };
}
