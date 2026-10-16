import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAidPLvFcIfk0VSpEI1q9sNBs1rZ9f4lX0",
  authDomain: "wishlistapp-c4d05.firebaseapp.com",
  projectId: "wishlistapp-c4d05",
  storageBucket: "wishlistapp-c4d05.firebasestorage.app",
  messagingSenderId: "641789432127",
  appId: "1:641789432127:web:8d4fbd9465278dc691c38a",
  measurementId: "G-75R5XSB4XL",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const storage = getStorage(app);
