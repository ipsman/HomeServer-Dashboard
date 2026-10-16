import { db } from "@/firebase";
import {
  getOrCreateUserId,
  getPartnerId,
  uploadImageToCloudinary,
} from "@/services/partnerService";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Wish {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: number;
  category: string;
  price: number;
  link: string;
  comment: string;
  imageLink?: string[]; // 👈 Több kép URL tömbje
  partnerComments?: PartnersComment[];
}

export interface PartnersComment {
  id: string;
  text: string;
  createdAt: string;
}

interface WishContextType {
  wishes: Wish[];
  partnerWishes: Wish[];
  addWish: (
    title: string,
    isCompleted: boolean,
    priority: number,
    category: string,
    price: number,
    link: string,
    comment: string,
    imageUris?: string[], // 👈 Több helyi kép URI-ja
    partnerComments?: PartnersComment[],
  ) => Promise<void>;
  deleteWish: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  togglePartnerComplete: (id: string) => Promise<void>;
  setCategory: (category: string) => void;
  getCategory: () => string;
  setPriority: (priority: number) => void;
  getPriority: () => number;
  refreshPartner: () => void;
  addPartnerComments: (id: string, text: string) => Promise<void>;
  deletePartnerComments: (wishId: string, commentId: string) => Promise<void>;
  editPartnerComments: (
    wishId: string,
    commentId: string,
    newComment: string,
  ) => Promise<void>;
}

const WishContext = createContext<WishContextType | undefined>(undefined);

export function WishProvider({ children }: { children: React.ReactNode }) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [partnerWishes, setPartnerWishes] = useState<Wish[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [partnerId, setPartnerIdState] = useState<string | null>(null);
  const [category, setCategoryState] = useState<string>("karacsony");
  const [priority, setPriorityState] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function initUsers() {
      try {
        const currentUserId = await getOrCreateUserId();
        if (isMounted) setUserId(currentUserId);

        const currentPartnerId = await getPartnerId();
        if (isMounted) setPartnerIdState(currentPartnerId);
      } catch (error) {
        console.error("Hiba a felhasználó inicializálásakor:", error);
      }
    }
    initUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Segédfunkció az adatok egységes képtömbbé alakítására (kompatibilis a régi string formátummal is)
  const parseImageLinks = (data: any): string[] => {
    const rawImages = data.imageLink || data.imageUri;
    if (Array.isArray(rawImages)) {
      return rawImages;
    }
    if (typeof rawImages === "string" && rawImages.trim().length > 0) {
      return [rawImages];
    }
    return [];
  };

  useEffect(() => {
    if (!userId) return;

    const myWishesRef = collection(db, "users", userId, "wishes");

    const unsubscribe = onSnapshot(
      myWishesRef,
      (snapshot) => {
        const loadedWishes: Wish[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || "",
            isCompleted: Boolean(data.isCompleted),
            priority: Number(data.priority) || 0,
            category: data.category || "",
            price: Number(data.price) || 0,
            link: data.link || "",
            comment: data.comment || "",
            imageLink: parseImageLinks(data),
            partnerComments: data.partnerComments || [],
          };
        });
        setWishes(loadedWishes);
      },
      (error) => {
        console.error("Hiba a saját kívánságok feliratkozásakor:", error);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (!partnerId) return;

    const partnerWishesRef = collection(db, "users", partnerId, "wishes");

    const unsubscribe = onSnapshot(
      partnerWishesRef,
      (snapshot) => {
        const loadedWishes: Wish[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || "",
            isCompleted: Boolean(data.isCompleted),
            priority: Number(data.priority) || 0,
            category: data.category || "",
            price: Number(data.price) || 0,
            link: data.link || "",
            comment: data.comment || "",
            imageLink: parseImageLinks(data),
            partnerComments: data.partnerComments || [],
          };
        });
        setPartnerWishes(loadedWishes);
      },
      (error) => {
        console.error("Hiba a partner kívánságok feliratkozásakor:", error);
      },
    );

    return () => unsubscribe();
  }, [partnerId]);

  // Új kívánság hozzáadása több kép feltöltésével
  const addWish = async (
    title: string,
    isCompleted: boolean,
    priority: number,
    category: string,
    price: number,
    link: string,
    comment: string,
    imageUris?: string[],
  ) => {
    const currentUserId = userId || (await getOrCreateUserId());

    const uploadedImageUrls: string[] = [];

    if (imageUris && imageUris.length > 0) {
      // Párhuzamosan feltöltjük az összes képet Cloudinary-ra
      const uploadPromises = imageUris.map((uri) =>
        uploadImageToCloudinary(uri),
      );
      const results = await Promise.all(uploadPromises);
      uploadedImageUrls.push(...results.filter((url) => Boolean(url)));
    }

    await addDoc(collection(db, "users", currentUserId, "wishes"), {
      title,
      isCompleted: Boolean(isCompleted),
      priority,
      category,
      price: Number(price),
      link,
      comment,
      imageLink: uploadedImageUrls, // 👈 Képek URL tömbjét mentjük
      partnerComments: [],
      createdAt: new Date().toISOString(),
    });
  };

  const deleteWish = async (id: string) => {
    const currentUserId = userId || (await getOrCreateUserId());
    await deleteDoc(doc(db, "users", currentUserId, "wishes", id));
  };

  const toggleComplete = async (id: string) => {
    const currentUserId = userId || (await getOrCreateUserId());
    const targetWish = wishes.find((w) => w.id === id);
    if (!targetWish) return;

    await updateDoc(doc(db, "users", currentUserId, "wishes", id), {
      isCompleted: !targetWish.isCompleted,
    });
  };

  const togglePartnerComplete = async (id: string) => {
    if (!partnerId) return;
    const targetWish = partnerWishes.find((w) => w.id === id);
    if (!targetWish) return;

    await updateDoc(doc(db, "users", partnerId, "wishes", id), {
      isCompleted: !targetWish.isCompleted,
    });
  };

  const refreshPartner = async () => {
    const pId = await getPartnerId();
    setPartnerIdState(pId);
  };

  const addPartnerComments = async (wishId: string, text: string) => {
    if (!partnerId) return;

    const newComment: PartnersComment = {
      id: "comm_" + Math.random().toString(36).substring(2, 9),
      text,
      createdAt: new Date().toISOString(),
    };

    const wishDocRef = doc(db, "users", partnerId, "wishes", wishId);
    await updateDoc(wishDocRef, {
      partnerComments: arrayUnion(newComment),
    });
  };

  const deletePartnerComments = async (wishId: string, commentId: string) => {
    if (!partnerId) return;

    const targetWish = partnerWishes.find((w) => w.id === wishId);
    if (!targetWish || !targetWish.partnerComments) return;

    const commentsToDelete = targetWish.partnerComments.find(
      (c) => c.id === commentId,
    );

    if (!commentsToDelete) return;

    const wishDocRef = doc(db, "users", partnerId, "wishes", wishId);
    await updateDoc(wishDocRef, {
      partnerComments: arrayRemove(commentsToDelete),
    });
  };

  const editPartnerComments = async (
    wishId: string,
    commentId: string,
    newText: string,
  ) => {
    if (!partnerId) return;

    const targetWish = partnerWishes.find((w) => w.id === wishId);
    if (!targetWish || !targetWish.partnerComments) return;

    const updateComments = targetWish.partnerComments.map((c) =>
      c.id === commentId ? { ...c, text: newText } : c,
    );

    const wishDocRef = doc(db, "users", partnerId, "wishes", wishId);
    await updateDoc(wishDocRef, {
      partnerComments: updateComments,
    });
  };

  return (
    <WishContext.Provider
      value={{
        wishes,
        partnerWishes,
        addWish,
        deleteWish,
        toggleComplete,
        togglePartnerComplete,
        setCategory: setCategoryState,
        getCategory: () => category,
        setPriority: setPriorityState,
        getPriority: () => priority,
        refreshPartner,
        addPartnerComments,
        deletePartnerComments,
        editPartnerComments,
      }}
    >
      {children}
    </WishContext.Provider>
  );
}

export function useWishes() {
  const context = useContext(WishContext);
  if (!context) throw new Error("useWishes must be used within a WishProvider");
  return context;
}
