import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  secureImageUri: string[];
  setImageOpened: (state: boolean) => void;
};

export default function ImageViewer({ secureImageUri, setImageOpened }: Props) {
  // 1. Használjunk React state-et az index tárolására
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!secureImageUri || secureImageUri.length === 0) {
    return null;
  }

  // 2. Léptetés kezelése biztonságos határok között
  const handlePrev = (e: any) => {
    e.stopPropagation(); // Megakadályozza,hogy a külső képkattintás lefusson
    setCurrentIndex((prev) =>
      prev === 0 ? secureImageUri.length - 1 : prev - 1,
    );
  };

  const handleNext = (e: any) => {
    e.stopPropagation(); // Megakadályozza,hogy a külső képkattintás lefusson
    setCurrentIndex((prev) =>
      prev === secureImageUri.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <View className="items-center justify-center p-3">
      <View className="relative">
        {/* Kép megnyitása nagyítva kattintásra */}
        <TouchableOpacity
          onPress={() => setImageOpened(true)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: secureImageUri[currentIndex] }}
            style={{ width: 320, height: 320, borderRadius: 12 }}
            resizeMode="cover"
            onError={(e) =>
              console.log("Image load error:", e.nativeEvent.error)
            }
          />
        </TouchableOpacity>

        {/* 3. Nyilak megjelenítése, HA TÖBB KÉP VAN (length > 1) */}
        {secureImageUri.length > 1 && (
          <>
            {/* Balra nyíl */}
            <TouchableOpacity
              className="absolute left-2 top-[45%] bg-black/50 p-2 rounded-full items-center justify-center z-10"
              onPress={handlePrev}
              activeOpacity={0.7}
            >
              <Text className="text-white text-sm font-bold">◀</Text>
            </TouchableOpacity>

            {/* Jobbra nyíl */}
            <TouchableOpacity
              className="absolute right-2 top-[45%] bg-black/50 p-2 rounded-full items-center justify-center z-10"
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <Text className="text-white text-sm font-bold">▶</Text>
            </TouchableOpacity>

            {/* Képszámláló indikátor (pl. 1/3) a kép alján */}
            <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-md">
              <Text className="text-white text-xs font-semibold">
                {currentIndex + 1} / {secureImageUri.length}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
