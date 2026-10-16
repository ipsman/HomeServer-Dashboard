import { db } from "@/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { FileSystemUploadType } from "expo-file-system/legacy";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Platform } from "react-native";

const USER_ID_KEY = "@wishlist_user_id";

export const getOrCreateUserId = async (): Promise<string> => {
  let userId = await AsyncStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = "user_" + Math.random().toString(36).substring(2, 9);
    await AsyncStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const generatePairingCode = async (): Promise<string> => {
  const userId = await getOrCreateUserId();
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await setDoc(doc(db, "pairing_codes", code), {
    ownerId: userId,
    createdAt: new Date().toISOString(),
  });

  return code;
};

export const connectWithPairingCode = async (code: string): Promise<string> => {
  const codeDocRef = doc(db, "pairing_codes", code.trim());
  const codeDoc = await getDoc(codeDocRef);

  if (!codeDoc.exists()) {
    throw new Error("The pairing code expired!");
  }

  const partnerId = codeDoc.data().ownerId;
  const myUserId = await getOrCreateUserId();

  if (partnerId === myUserId) {
    throw new Error("You cannot use your pairing code!");
  }

  await setDoc(doc(db, "users", myUserId), { partnerId }, { merge: true });
  await setDoc(
    doc(db, "users", partnerId),
    { partnerId: myUserId },
    { merge: true },
  );

  await AsyncStorage.setItem("@partner_user_id", partnerId);

  return partnerId;
};

export const getPartnerId = async (): Promise<string | null> => {
  const myUserId = await getOrCreateUserId();
  const userDoc = await getDoc(doc(db, "users", myUserId));

  if (userDoc.exists() && userDoc.data()?.partnerId) {
    return userDoc.data().partnerId;
  }
  return null;
};

export const uploadImageToCloudinary = async (uri: string): Promise<string> => {
  // ⚠️ 1. Cseréld ki a pontos Cloud Name-re a Cloudinary Dashboard-ról!
  const cloudName = "o863ydh2";
  const uploadPreset = "images";

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    // 🌐 WEBES KÖRNYEZET (Expo Web / Böngésző)
    if (Platform.OS === "web") {
      const formData = new FormData();

      // 1. Átalakítjuk a helyi URI-t bináris adattá (Blob)
      const imageFetch = await fetch(uri);
      const blob = await imageFetch.blob();

      // 2. Csatoljuk a FormData-hoz
      formData.append("file", blob);
      formData.append("upload_preset", uploadPreset);

      // 3. Elküldjük a kérést
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok && result.secure_url) {
        return result.secure_url;
      } else {
        console.error("Cloudinary hibaüzenet:", result);
        throw new Error(result.error?.message || "Sikertelen feltöltés");
      }
    }
    // 📱 NATÍV KÖRNYEZET (Android / iOS)
    else {
      const response = await FileSystem.uploadAsync(uploadUrl, uri, {
        httpMethod: "POST",
        uploadType: FileSystemUploadType.MULTIPART,
        fieldName: "file",
        parameters: {
          upload_preset: uploadPreset,
        },
      });

      const result = JSON.parse(response.body);

      if (result.secure_url) {
        return result.secure_url;
      } else {
        throw new Error(result.error?.message || "Sikertelen feltöltés");
      }
    }
  } catch (error) {
    console.error("Cloudinary feltöltési hiba:", error);
    throw error;
  }
};
