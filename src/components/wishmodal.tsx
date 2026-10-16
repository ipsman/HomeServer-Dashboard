import { useSettings } from "@/context/settingsController";
import { PartnersComment } from "@/context/WishContext";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
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
import ImageViewer from "./ImageViewer";

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
};

export default function WishModal({
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
}: Props) {
  const { theme } = useSettings();
  const isDarkMode = theme?.toLowerCase() === "dark";

  const isExpanded = useSharedValue(false);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const deleteScale = useSharedValue(0);
  const color = useSharedValue(isDarkMode ? "#1e293b" : "#ffffff");

  const [isImageOpened, setImageOpened] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [newCommentText, setNewCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const categoryEmoji =
    CATEGORIES.find((cat) => cat.key === category)?.emoji || category;

  // 🖼️ Helyes tömb ellenőrzés
  const hasImage = Boolean(imageLink && imageLink.length > 0);
  const secureImageUris = imageLink.map((url) =>
    url.replace("http://", "https://"),
  );

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
    <View className="my-2 relative overflow-visible h-full flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
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
            <View className="flex justify-between items-center gap-2">
              <View className="w-full flex-row justify-between items-center">
                <Text
                  className={`text-2xl flex-1 pr-2 ${
                    isCompleted
                      ? "line-through text-slate-400 dark:text-slate-500"
                      : "text-slate-700 dark:text-slate-100 font-bold"
                  }`}
                  numberOfLines={2}
                >
                  {title}
                </Text>
                {Boolean(link) ? (
                  <TouchableOpacity
                    onPress={() => link && Linking.openURL(link)}
                    className="p-2 ml-1"
                  >
                    <Text className="text-lg">🔗</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* 📸 KÉP NÉZET (ImageViewer komponensnek továbbítva) */}
              {hasImage ? (
                <View className="w-full my-2">
                  <ImageViewer
                    secureImageUri={secureImageUris}
                    setImageOpened={setImageOpened}
                  />
                </View>
              ) : null}

              <View className="flex-row items-start w-full mt-1">
                <TouchableOpacity
                  onPress={() => !isPartnersWish && toggleComplete(id)}
                  activeOpacity={isPartnersWish ? 1 : 0.8}
                  className="flex-1 flex-row items-center gap-3"
                >
                  <View className="flex-1">
                    {category ? (
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-base text-slate-400 dark:text-slate-400 font-medium">
                          Category:
                        </Text>
                        <Text className="text-base">{categoryEmoji}</Text>
                      </View>
                    ) : null}

                    {Boolean(price) || priority > 1 ? (
                      <View className="flex items-start gap-1">
                        {typeof price === "number" && price > 0 ? (
                          <View className="flex-row items-center gap-2">
                            <Text className="text-base text-slate-400 dark:text-slate-400 font-medium">
                              Price:
                            </Text>
                            <Text className="text-base text-slate-700 dark:text-slate-200 font-bold">
                              {price} Ft
                            </Text>
                          </View>
                        ) : null}
                        {priority > 1 ? (
                          <View className="flex-row items-center gap-2">
                            <Text className="text-base text-slate-400 dark:text-slate-400 font-medium">
                              Priority:
                            </Text>
                            <Text className="text-base">
                              {"⭐".repeat(priority)}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}

                    {Boolean(comment) ? (
                      <View className="mt-2">
                        <Text className="text-base text-slate-400 dark:text-slate-400 font-medium mb-1">
                          Comment:
                        </Text>
                        <Text className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          {comment}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* PARTNER KOMMENT SZEKCIÓ */}
            <View className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
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
                    className="flex-1 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs p-2.5 rounded-xl"
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
                    className="bg-sky-500 px-3.5 py-2 rounded-xl justify-center items-center"
                  >
                    <Text className="text-white text-xs font-bold">Send</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>
        </GestureDetector>

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
                  source={{ uri: imageLink[selectedImageIndex] }}
                  style={{ width: 340, height: 380, borderRadius: 16 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        ) : null}

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
      </ScrollView>
    </View>
  );
}
