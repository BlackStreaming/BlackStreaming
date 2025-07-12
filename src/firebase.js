import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDYacL_WIzZUSP-Tjl3794P_jHocMDqN9g",
  authDomain: "blackkstreaming-55f0e.firebaseapp.com",
  projectId: "blackkstreaming-55f0e",
  storageBucket: "blackkstreaming-55f0e.firebasestorage.app",
  messagingSenderId: "998157647233",
  appId: "1:998157647233:web:3e5b8128a0275ae4553c80",
  measurementId: "G-GFM50WNMSP",
};

// 🔥 ESTE es el cambio importante
export const app = initializeApp(firebaseConfig);

// Inicializar servicios
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
