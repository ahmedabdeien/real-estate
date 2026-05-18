import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "elsarh-real-estate.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "elsarh-real-estate",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "elsarh-real-estate.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "408314874064",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:408314874084:web:ee5a64719bf201e56084f1",
};

// Prevent duplicate-app error on Vite HMR reloads
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
// Auth only — Storage moved to Cloudinary (free 25GB)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Facebook provider
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");
facebookProvider.addScope("public_profile");

// Apple provider
export const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");
