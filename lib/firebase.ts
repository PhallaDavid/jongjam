import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-bEVAGURKHROHtrqEZ2kUTsBxnoiuBZ4",
  authDomain: "jongjam-1ea29.firebaseapp.com",
  projectId: "jongjam-1ea29",
  storageBucket: "jongjam-1ea29.firebasestorage.app",
  messagingSenderId: "152137871620",
  appId: "1:152137871620:web:ccb1746decb9e0c3e4a051",
  measurementId: "G-JQMM13SJJC",
};

// Check if Firebase is properly configured
const isFirebaseConfigured =
  typeof firebaseConfig.apiKey === "string" &&
  firebaseConfig.apiKey.length > 0 &&
  firebaseConfig.apiKey !== "undefined";

if (typeof window !== "undefined") {
  console.log("Firebase Init [Client]:", {
    isConfigured: isFirebaseConfigured,
    apiKeyLength: firebaseConfig.apiKey?.length,
    apiKeyPrefix: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 6) + "..." : "none",
  });
}

const app = isFirebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;

export const db = app ? getFirestore(app) : null as unknown as Firestore;
export const auth = app ? getAuth(app) : null as unknown as Auth;
export const googleProvider = new GoogleAuthProvider();

