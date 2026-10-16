import { useSettings } from "@/context/settingsController";
import { PartnersComment } from "@/context/WishContext";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { CATEGORIES } from "./categories";

type Props = {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: number;
  category: string;
  price?: number;
  link?: string;
  comment?: string;
  imageLink?: string[];
  partnerComments?: PartnersComment[];
  deleteWish: (id: string) => void;
  toggleComplete: (id: string) => void;
  isPartnersWish: boolean;
  onAddPartnerComment?: (wishId: string, text: string) => void;
  onDeletePartnerComment?: (wishId: string, commentId: string) => void;
  onEditPartnerComment?: (
    wishId: string,
    commentId: string,
    newText: string,
  ) => void;
  openWishModal: (id: string) => void;
};

export default function WishItem({
  id,
  title,
  isCompleted,
  priority,
  category,
  price,
  link,
  comment,
  imageLink = [],
  partnerComments = [],
  deleteWish,
  toggleComplete,
  isPartnersWish,
  onAddPartnerComment,
  onDeletePartnerComment,
  onEditPartnerComment,
  openWishModal,
}: Props) {
  const { theme } = useSettings();
  const isDarkMode = theme?.toLowerCase() === "dark";

  const isExpanded = useSharedValue(false);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const deleteScale = useSharedValue(0);
  const color = useSharedValue(isDarkMode ? "#1e293b" : "#ffffff");

  const [isImageOpened, setImageOpened] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const categoryEmoji =
    CATEGORIES.find((cat) => cat.key === category)?.emoji || category;

  // 🖼️ Helyes tömb-ellenőrzés a képekhez
  const hasImage = Boolean(imageLink && imageLink.length > 0);
  const firstImageUri = hasImage
    ? imageLink[0]?.replace("http://", "https://")
    : "";

  const longPressGesture = Gesture.LongPress()
    .minDuration(150)
    .onStart(() => {
      if (isPartnersWish) return;

      isExpanded.value = !isExpanded.value;
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);

      if (isExpanded.value) {
        scale.value = withSpring(0.95);
        color.value = withTiming("#fda4af", { duration: 150 });
        deleteScale.value = withSpring(1);

        rotation.value = withRepeat(
          withSequence(
            withTiming(-1, { duration: 80 }),
            withTiming(1, { duration: 80 }),
          ),
          -1,
          true,
        );
      } else {
        scale.value = withSpring(1);
        deleteScale.value = withTiming(0, { duration: 150 });
        color.value = withTiming(isDarkMode ? "#1e293b" : "#ffffff", {
          duration: 150,
        });

        cancelAnimation(rotation);
        rotation.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    backgroundColor: color.value,
  }));

  const animatedDeleteButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deleteScale.value }],
    opacity: deleteScale.value,
  }));

  return (
    <View className="my-2 relative overflow-visible">
      <GestureDetector gesture={longPressGesture}>
        <Animated.View
          style={[
            animatedCardStyle,
            {
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDarkMode ? "#334155" : "#f1f5f9",
            },
          ]}
        >
          <View className="flex-row justify-between items-center gap-2">
            <TouchableOpacity
              onPress={() =>
                !isPartnersWish ? toggleComplete(id) : openWishModal(id)
              }
              activeOpacity={isPartnersWish ? 1 : 0.8}
              className="flex-1 flex-row items-center gap-3"
            >
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  isCompleted
                    ? "bg-emerald-400 border-emerald-400"
                    : "border-slate-300 dark:border-slate-600"
                } ${isPartnersWish ? "opacity-60" : ""}`}
              >
                {isCompleted ? (
                  <Text className="text-white text-xs font-bold">✓</Text>
                ) : null}
              </View>

              {category ? (
                <Text className="text-base">{categoryEmoji}</Text>
              ) : null}

              <View className="flex-1 ml-2">
                <Text
                  className={`text-base ${
                    isCompleted
                      ? "line-through text-slate-400 dark:text-slate-500"
                      : "text-slate-700 dark:text-slate-100 font-medium"
                  }`}
                  numberOfLines={1}
                >
                  {title}
                </Text>

                {Boolean(comment) ? (
                  <Text
                    className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
                    numberOfLines={1}
                  >
                    💬 {comment}
                  </Text>
                ) : null}

                {Boolean(price) || priority > 1 ? (
                  <View className="flex-row items-center gap-2 mt-0.5">
                    {typeof price === "number" && price > 0 ? (
                      <Text className="text-xs text-slate-400 dark:text-slate-400 font-medium">
                        {price} Ft
                      </Text>
                    ) : null}
                    {priority > 1 ? (
                      <Text className="text-xs">{"⭐".repeat(priority)}</Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>

            {/* 📸 Első kép előnézete + darabszám badge ha 1-nél több kép van */}
            {hasImage ? (
              <TouchableOpacity
                onPress={() => setImageOpened(true)}
                activeOpacity={0.8}
                className="relative"
              >
                <Image
                  source={{ uri: firstImageUri }}
                  style={{ width: 48, height: 48, borderRadius: 8 }}
                  resizeMode="cover"
                  onError={(e) =>
                    console.log("Image load error:", e.nativeEvent.error)
                  }
                />
                {imageLink.length > 1 ? (
                  <View className="absolute -bottom-1 -right-1 bg-black/70 px-1.5 py-0.5 rounded-full">
                    <Text className="text-[10px] text-white font-bold">
                      +{imageLink.length - 1}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ) : null}

            {Boolean(link) ? (
              <TouchableOpacity
                onPress={() => link && Linking.openURL(link)}
                className="p-2 ml-1"
              >
                <Text className="text-lg">🔗</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* PARTNER KOMMENT SZEKCIÓ */}
          <View className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">
              Comments for partner:
            </Text>

            {partnerComments.map((comm) => (
              <View
                key={comm.id}
                className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl mb-1.5 flex-row justify-between items-center"
              >
                {editingCommentId === comm.id && isPartnersWish ? (
                  <TextInput
                    className="flex-1 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 mr-2"
                    value={editText}
                    onChangeText={setEditText}
                    autoFocus
                  />
                ) : (
                  <Text className="flex-1 text-xs text-slate-700 dark:text-slate-300">
                    {comm.text}
                  </Text>
                )}

                {isPartnersWish && (
                  <View className="flex-row gap-2">
                    {editingCommentId === comm.id ? (
                      <TouchableOpacity
                        onPress={() => {
                          if (editText.trim()) {
                            onEditPartnerComment?.(
                              id,
                              comm.id,
                              editText.trim(),
                            );
                            setEditingCommentId(null);
                          }
                        }}
                      >
                        <Text className="text-xs text-emerald-500 font-bold">
                          Save
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setEditingCommentId(comm.id);
                          setEditText(comm.text);
                        }}
                      >
                        <Text className="text-xs text-sky-500">✏️</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => onDeletePartnerComment?.(id, comm.id)}
                    >
                      <Text className="text-xs text-rose-500">🗑️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {isPartnersWish && (
              <View className="flex-row gap-2 mt-2">
                <TextInput
                  className="flex-1 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs p-2 rounded-xl"
                  placeholder="Write a comment..."
                  placeholderTextColor="#94a3b8"
                  value={newCommentText}
                  onChangeText={setNewCommentText}
                />
                <TouchableOpacity
                  onPress={() => {
                    if (newCommentText.trim()) {
                      onAddPartnerComment?.(id, newCommentText.trim());
                      setNewCommentText("");
                    }
                  }}
                  className="bg-sky-500 px-3 py-2 rounded-xl justify-center items-center"
                >
                  <Text className="text-white text-xs font-bold">Send</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Kép megnyitása Modalban */}
      {isImageOpened && hasImage ? (
        <Modal
          transparent={true}
          animationType="fade"
          visible={true}
          onRequestClose={() => setImageOpened(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setImageOpened(false)}
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity activeOpacity={1}>
              <Image
                source={{ uri: firstImageUri }}
                style={{ width: 340, height: 380, borderRadius: 16 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      ) : null}

      {/* Törlés gomb (Saját vágyaknál) */}
      {!isPartnersWish && (
        <Animated.View
          style={[
            animatedDeleteButtonStyle,
            {
              position: "absolute",
              top: -10,
              right: 12,
              zIndex: 20,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => deleteWish(id)}
            className="bg-rose-500 w-8 h-8 rounded-full justify-center items-center shadow-md"
            activeOpacity={0.7}
          >
            <Text className="text-xs text-white">🗑️</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
