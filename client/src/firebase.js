// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "elsarh-real-estate.firebaseapp.com",
  projectId: "elsarh-real-estate",
  storageBucket: "elsarh-real-estate.appspot.com",
  messagingSenderId: "408314874084",
  appId: "1:408314874084:web:ee5a64719bf201e56084f1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);