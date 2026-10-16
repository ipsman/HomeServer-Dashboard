import CategoryPicker from "@/components/categories";
import { useSettings } from "@/context/settingsController";
import { useWishes } from "@/context/WishContext";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Keyboard,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [title, setTitle] = useState("");
  const [prize, setPrize] = useState("");
  const [link, setLink] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { appColor, theme } = useSettings();

  const scale = useSharedValue(1);

  // 📸 Több kép tárolása tömbben
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const { addWish, setCategory, getCategory, getPriority, setPriority } =
    useWishes();

  const isDarkMode = theme?.toLowerCase() === "dark";
  const currentPriority = getPriority();

  const handleAddTransaction = async (isCompleted: boolean) => {
    if (!title.trim()) return;

    const parsedAmount = parseFloat(prize.replace(",", "."));
    const finalPrice = isNaN(parsedAmount) ? 0 : parsedAmount;

    setLoading(true);

    try {
      await addWish(
        title.trim(),
        isCompleted,
        getPriority(),
        getCategory(),
        finalPrice,
        link.trim(),
        comment.trim(),
        selectedImages, // 👈 Átadjuk a képek tömbjét
      );

      setTitle("");
      setPrize("");
      setLink("");
      setComment("");
      setSelectedImages([]); // 👈 Visszaállítás üres tömbre
      setPriority(0);
      Keyboard.dismiss();

      router.navigate("/(tabs)/myWishListScreen");
    } catch (error) {
      console.error("Error saving wish:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🖼️ Több kép kiválasztása a galériából
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true, // 👈 Engedélyezi a több kép kijelölését
      selectionLimit: 5, // Szükség esetén korlátozható (pl. max 5 kép)
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      // Hozzáfűzzük a már meglévő kiválasztott képekhez
      setSelectedImages((prev) => [...prev, ...newUris]);
    }
  };

  // 🗑️ Egy adott kép eltávolítása a listából
  const removeImage = (indexToRemove: number) => {
    setSelectedImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const onPriorityChange = (num: number) => {
    const val = Math.round(num);
    if (val !== currentPriority) {
      setPriority(val);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      scale.value = withSequence(
        withSpring(1.4, { damping: 8, stiffness: 220 }),
        withSpring(1, { damping: 10, stiffness: 150 }),
      );
    }
  };

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const priorityLabels = [
    "Nice to have ☁️",
    "Would be cool ✨",
    "Want it! 💖",
    "Must have 🔥",
    "TOP PRIORITY 👑",
  ];

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="flex-1 bg-slate-100 dark:bg-slate-900"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-5 pt-2">
          <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
          <Text className="text-xl font-bold text-center mb-3 text-slate-800 dark:text-white">
            ✨My Wishlist✨
          </Text>

          <View className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl mb-5 shadow-sm border border-transparent dark:border-slate-700">
            <TextInput
              className="border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl mb-2.5 text-base bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
              placeholder="Wish Name"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              className="border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl mb-3 text-base bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
              placeholder="Wish Link"
              placeholderTextColor="#94a3b8"
              value={link}
              onChangeText={setLink}
            />
            <TextInput
              className="border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl mb-3 text-base bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
              placeholder="Wish Amount (Ft)"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              value={prize}
              onChangeText={setPrize}
            />

            <TextInput
              className="border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl mb-3 text-base bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
              placeholder="Comment"
              placeholderTextColor="#94a3b8"
              numberOfLines={3}
              multiline
              value={comment}
              onChangeText={setComment}
            />

            <View className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl mb-3 border border-slate-200/80 dark:border-slate-700">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Priority Level
                </Text>

                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {priorityLabels[Math.max(0, currentPriority - 1)]}
                </Text>
              </View>
              <View className="items-center my-2">
                <Animated.View
                  style={[animatedTextStyle]}
                  className="flex-row items-center gap-1"
                >
                  <Text className="text-2xl font-black text-amber-400">
                    {"⭐".repeat(currentPriority)}
                  </Text>
                  <Text className="text-sm font-bold text-slate-400 dark:text-slate-500 ml-1">
                    ({currentPriority}/5)
                  </Text>
                </Animated.View>
              </View>

              <Slider
                style={{ width: "100%", height: 36 }}
                value={currentPriority}
                onValueChange={onPriorityChange}
                minimumValue={1}
                maximumValue={5}
                step={1}
                minimumTrackTintColor={appColor}
                maximumTrackTintColor={isDarkMode ? "#334155" : "#cbd5e1"}
                thumbTintColor={appColor}
              />
            </View>

            <CategoryPicker
              setCategory={setCategory}
              category={getCategory()}
            />

            {/* Képek hozzáadása gomb */}
            <TouchableOpacity
              style={{ backgroundColor: appColor }}
              className="p-3.5 rounded-xl items-center mb-3 mt-1"
              onPress={pickImageAsync}
            >
              <Text className="text-white font-bold text-base">
                {selectedImages.length > 0
                  ? `Add More Images (${selectedImages.length})`
                  : "Add Images"}
              </Text>
            </TouchableOpacity>

            {/* 📸 Vízszintesen görgethető kép előnézeti galéria */}
            {selectedImages.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3"
              >
                <View className="flex-row gap-2">
                  {selectedImages.map((uri, index) => (
                    <View key={index} className="relative">
                      <Image
                        source={{ uri }}
                        className="w-28 h-28 rounded-xl"
                        resizeMode="cover"
                      />
                      {/* Törlés gomb a kép sarkában */}
                      <TouchableOpacity
                        onPress={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black/60 w-6 h-6 rounded-full items-center justify-center"
                      >
                        <Text className="text-white font-bold text-xs">✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : null}

            <TouchableOpacity
              style={{
                backgroundColor: title.trim()
                  ? appColor
                  : isDarkMode
                    ? "#334155"
                    : "#cbd5e1",
              }}
              className="p-3.5 rounded-xl items-center"
              disabled={!title.trim() || loading}
              onPress={() => handleAddTransaction(false)}
            >
              <Text className="text-white font-bold text-base">
                {loading ? "Adding..." : "Add Wish"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
