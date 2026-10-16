import { useSettings } from '@/context/settingsController';
import * as Haptics from 'expo-haptics';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

type Props = {
  title: string;
  prize: number;
  isCompleted: boolean;
  onDelete?: () => void;
  link: string;
};

export default function TransactionItem({
  title,
  prize,
  isCompleted,
  onDelete,
  link,
}: Props) {
  const isExpanded = useSharedValue(false);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const deleteScale = useSharedValue(0);
  const color = useSharedValue("#ffffff");

  const { appColor } = useSettings();

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      isExpanded.value = !isExpanded.value;
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);

      if (isExpanded.value) {
        scale.value = withSpring(0.95);
        color.value = withTiming("#fda4af", { duration: 150 });

        deleteScale.value = withSpring(1.5);


        rotation.value = withRepeat(
          withSequence(
            withTiming(-0.2, { duration: 80 }),
            withTiming(0.2, { duration: 80 })
          ),
          -1, 
          true
        );
      } else {

        scale.value = withSpring(1);
        deleteScale.value = withTiming(0, { duration: 150 });
        color.value = withTiming("#ffffff", { duration: 150 });


        cancelAnimation(rotation);
        rotation.value = withSpring(0);
      }
    });


  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    backgroundColor: color.value,
  }));


  const animatedDeleteButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deleteScale.value }],
    opacity: deleteScale.value,
  }));

  return (
    <View className="relative mb-3 overflow-visible">
      <GestureDetector gesture={longPressGesture}>
        <Animated.View
          style={[animatedCardStyle, styles.card]}
          className="bg-[#636060] py-6 rounded-xl flex-row justify-between items-center shadow-sm border gap-3 border-slate-100">
          <Text className="text-base text-slate-700 font-medium">✨{title}</Text>
          <Text
            className={`text-base font-bold ${
              isCompleted ? "text-rose-600" : "text-emerald-600"
            }`}>
            {isCompleted ? "-" : "+"}{prize.toLocaleString("hu-HU")} Ft
          </Text>

          <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Linking.openURL(link)}
          style={{backgroundColor: appColor}}
          className="p-2 rounded-full shadow-md justify-center items-center"
        >
          <Text className="text-sm text-white">Open link</Text>
        </TouchableOpacity>
        </Animated.View>
      </GestureDetector>

      <Animated.View
        style={animatedDeleteButtonStyle}
        className="absolute -top-4 right-6 z-10 overflow-visible">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (onDelete) onDelete();
          }}
          className="bg-rose-500 w-6 h-6 rounded-full shadow-md justify-center items-center">
          <Text className="text-sm text-white">🗑️</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#636060',
    paddingVertical: 24, // py-6
    borderRadius: 12,    // rounded-xl
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000', // shadow-sm (opcionális natív árnyék)
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,      // border
    borderColor: '#f1f5f9', // border-slate-100
    gap: 12,             // gap-3
  },
});