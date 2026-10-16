import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme } from "nativewind";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Settings {
  girlMode: boolean;
  theme: "light" | "dark";
}

interface SettingsContextType extends Settings {
  appColor: string;
  tabTitle: string;
  setGirlMode: (value: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

const STORAGE_KEY_SETTINGS = "@expensepro_settings";

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [girlMode, setGirlModeState] = useState<boolean>(false);
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  const appColor = girlMode ? "#ff6cc7" : "#7dd3fc";
  const tabTitle = girlMode ? "His Wishlist" : "Her Wishlist";

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedSt = await AsyncStorage.getItem(STORAGE_KEY_SETTINGS);

        if (savedSt) {
          const parsed: Settings = JSON.parse(savedSt);
          const loadedTheme = parsed.theme || "light";

          setGirlModeState(parsed.girlMode ?? false);
          setThemeState(loadedTheme);
          colorScheme.set(loadedTheme);
        }
      } catch (e) {
        console.error("Hiba az adatok betöltésekor:", e);
      }
    };
    loadData();
  }, []);

  const setGirlMode = async (value: boolean) => {
    setGirlModeState(value);
    saveSettings(value, theme);
  };

  const setTheme = async (value: "light" | "dark") => {
    setThemeState(value);
    colorScheme.set(value);
    saveSettings(girlMode, value);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  const saveSettings = async (
    newGirlMode: boolean,
    newTheme: "light" | "dark",
  ) => {
    try {
      const settingsToSave: Settings = {
        girlMode: newGirlMode,
        theme: newTheme,
      };
      await AsyncStorage.setItem(
        STORAGE_KEY_SETTINGS,
        JSON.stringify(settingsToSave),
      );
    } catch (e) {
      console.error("Hiba az adatok mentésekor:", e);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        appColor,
        tabTitle,
        girlMode,
        theme,
        setGirlMode,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
