import { useSettings } from "@/context/settingsController";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const { appColor, tabTitle, theme } = useSettings();
  const isDarkMode = theme?.toLowerCase() === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: appColor,
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? "#1e293b" : "#f1f5f9",
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Overview",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="storage"
        options={{
          title: "Storage",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="database" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="components"
        options={{
          title: "Components",
          tabBarIcon: ({ color, size }) => (
            <Feather name="cpu" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="apps" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
