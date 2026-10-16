export const CATEGORIES = [
  { key: "karacsony", emoji: "🎄" },
  { key: "szulinap", emoji: "🎂" },
  { key: "nevnap", emoji: "📆" },
  { key: "valentin", emoji: "❤️‍🔥" },
  { key: "meglepi", emoji: "🎁" },
];

import { useSettings } from "@/context/settingsController";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  setCategory: (category: string) => void;
  category: string;
};

export default function CategoryPicker({ setCategory, category }: Props) {
  const { appColor, theme } = useSettings();
  const isDarkMode = theme?.toLowerCase() === "dark";

  return (
    <View className="flex-row items-center gap-2 mb-3">
      <Text className="text-sm text-slate-500 dark:text-slate-400 mr-1">
        Category:
      </Text>
      {CATEGORIES.map((cat) => {
        const isSelected = category === cat.key;

        return (
          <TouchableOpacity
            key={cat.key}
            style={{
              backgroundColor: isSelected
                ? appColor
                : isDarkMode
                  ? "#0f172a"
                  : "#f8fafc",
              borderColor: isSelected
                ? appColor
                : isDarkMode
                  ? "#334155"
                  : "#e2e8f0",
            }}
            className="flex-1 p-2.5 rounded-xl items-center border-2"
            onPress={() => setCategory(cat.key)}
          >
            <Text className="text-lg">{cat.emoji}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
