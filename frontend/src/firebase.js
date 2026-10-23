

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyArfOh9cPvvMkbPALGLceX8O8pnkCVTAyM",
  authDomain: "logistics-parcel-trackin-25690.firebaseapp.com",
  projectId: "logistics-parcel-trackin-25690",
  storageBucket: "logistics-parcel-trackin-25690.firebasestorage.app",
  messagingSenderId: "327627332763",
  appId: "1:327627332763:web:6d8f33f96e425effbe3a3e"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
