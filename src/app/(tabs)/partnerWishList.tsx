import MyWishList from "@/components/myWishList";
import WishModal from "@/components/wishmodal";
import { useSettings } from "@/context/settingsController";
import { useWishes, Wish } from "@/context/WishContext";
import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PartnerWishList() {
  const { tabTitle } = useSettings();
  const {
    partnerWishes,
    deleteWish,
    togglePartnerComplete,
    addPartnerComments,
    deletePartnerComments,
    editPartnerComments,
  } = useWishes();

  // A kiválasztott kívánság állapota Modal megjelenítéséhez
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);

  const handleOpenWishModal = (id: string) => {
    const foundWish = partnerWishes.find((w) => w.id === id);
    if (foundWish) {
      setSelectedWish(foundWish);
    }
  };

  const handleCloseModal = () => {
    setSelectedWish(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-900">
      <View className="flex-1 px-5 pt-2">
        <Text className="text-xl font-bold text-center mb-4 text-slate-800 dark:text-white">
          {tabTitle}
        </Text>

        <MyWishList
          wishes={partnerWishes}
          isPartnersList={true}
          handleDelete={deleteWish}
          toggleComplete={togglePartnerComplete}
          onAddPartnerComment={addPartnerComments}
          onDeletePartnerComment={deletePartnerComments}
          onEditPartnerComment={editPartnerComments}
          onOpenWishModal={handleOpenWishModal}
        />

        {/* MODAL MEGJELENÍTÉSE */}
        {selectedWish && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={Boolean(selectedWish)}
            onRequestClose={handleCloseModal}
          >
            <View className="flex-1 justify-end bg-black/60">
              <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-5 h-[85%] relative shadow-2xl">
                {/* Bezárás (X) gomb */}
                <TouchableOpacity
                  onPress={handleCloseModal}
                  className="absolute top-4 right-4 z-50 bg-slate-100 dark:bg-slate-700 w-9 h-9 rounded-full items-center justify-center"
                >
                  <Text className="text-slate-600 dark:text-slate-200 font-bold text-base">
                    ✕
                  </Text>
                </TouchableOpacity>

                {/* WishModal Részletek */}
                <WishModal
                  id={selectedWish.id}
                  title={selectedWish.title}
                  isCompleted={selectedWish.isCompleted}
                  priority={selectedWish.priority}
                  category={selectedWish.category}
                  price={selectedWish.price}
                  link={selectedWish.link}
                  comment={selectedWish.comment}
                  imageLink={selectedWish.imageLink || []}
                  partnerComments={selectedWish.partnerComments || []}
                  deleteWish={deleteWish}
                  toggleComplete={togglePartnerComplete}
                  isPartnersWish={true}
                  onAddPartnerComment={addPartnerComments}
                  onDeletePartnerComment={deletePartnerComments}
                  onEditPartnerComment={editPartnerComments}
                />
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}
