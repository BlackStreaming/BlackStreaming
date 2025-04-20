// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBb3XwPEzIWuFTsKV4H8fExuNhNQU2tZSI",
  authDomain: "blackstreaming-d73d7.firebaseapp.com",
  projectId: "blackstreaming-d73d7",
  storageBucket: "blackstreaming-d73d7.firebasestorage.app",
  messagingSenderId: "897499611621",
  appId: "1:897499611621:web:87d1e216fb953a42d9af0c",
  measurementId: "G-Y2WXTK43N3"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const db = getFirestore(app); // Base de datos
export const auth = getAuth(app); // Autenticación
export const storage = getStorage(app); // Almacenamiento