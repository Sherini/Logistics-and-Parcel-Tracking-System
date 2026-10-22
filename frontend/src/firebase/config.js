
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAyXb8A1Gh627-kceyiHpkJo0tmSf7QO0M",
  authDomain: "logistics-parcel-tracking.firebaseapp.com",
  projectId: "logistics-parcel-tracking",
  storageBucket: "logistics-parcel-tracking.firebasestorage.app",
  messagingSenderId: "849037101515",
  appId: "1:849037101515:web:cb4a7a9ecf203f5775ce4e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
