import MyWishList from "@/components/myWishList";
import { useWishes } from "@/context/WishContext";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyWishListScreen() {
  const { wishes, deleteWish, toggleComplete } = useWishes();

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="flex-1 bg-slate-100 dark:bg-slate-900"
    >
      <View className="flex-1 px-5 pt-2">
        <Text className="text-xl font-bold text-center mb-4 text-slate-800 dark:text-white">
          My Wishlist
        </Text>
        <MyWishList
          wishes={wishes}
          handleDelete={deleteWish}
          toggleComplete={toggleComplete}
          isPartnersList={false}
        />
      </View>
    </SafeAreaView>
  );
}
