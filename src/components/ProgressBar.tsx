import { useSettings } from "@/context/settingsController";
import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  label?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}

export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  progress,
  showPercentage = true,
  label,
  size = 120,
  strokeWidth = 10,
  color = "#f8fafc",
  trackColor = "#3a3a3a",
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const halfSize = size / 2;

  const { appColor, theme } = useSettings();
  const isDarkMode = theme?.toLowerCase() === "dark";

  trackColor = isDarkMode ? "#0f172a" : "#f1f5f9";

  useEffect(() => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    Animated.timing(animatedValue, {
      toValue: clampedProgress,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: "clamp",
  });

  const safeProgress = Math.round(Math.min(Math.max(progress, 0), 100));

  // Biztonsági ellenőrzés: ha Tailwind osztályt kapna (pl. "bg-slate-50"), átalakítjuk hex-re
  const strokeColor = color.startsWith("bg-") ? "#f8fafc" : color;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${halfSize}, ${halfSize}`}>
          {/* Háttér kör */}
          <Circle
            cx={halfSize}
            cy={halfSize}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animált progress kör */}
          <AnimatedCircle
            cx={halfSize}
            cy={halfSize}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset as any}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Középső feliratok */}
      <View className="absolute items-center justify-center p-2">
        {label && (
          <Text
            className="font-semibold text-gray-400 text-center mb-0.5"
            style={{ fontSize: size / 8 }}
          >
            {label}
          </Text>
        )}
        {showPercentage && (
          <Text
            className="font-bold text-slate-800 dark:text-white"
            style={{ fontSize: size / 9 }}
          >
            {safeProgress}%
          </Text>
        )}
      </View>
    </View>
  );
};
