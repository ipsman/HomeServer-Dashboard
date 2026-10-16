import { StyleSheet, View, Pressable, Text } from 'react-native';

type Props = {
  label: string;
  color?: string;
  size?: string;
  onPress: void;
};

export default function Button({ label, color="bg-[#ffaa00]", size="w-[300px] h-[70px]", onPress }: Props) {
  return (
    <View className={`${size} items-center justify-center p-3`}>
      <Pressable className={`${color} rounded-lg w-full h-full items-center justify-center flex-row}`} onPress={() => onPress}>
        <Text className='color-white text-[16px]'>{label}</Text>
      </Pressable>
    </View>
  );
}