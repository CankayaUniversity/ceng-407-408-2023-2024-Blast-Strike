// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "process.env.EXPO_PUBLIC_KEY",
  authDomain: "process.env.EXPO_PUBLIC_AUTH_DOMAIN",
  projectId: "process.env.EXPO_PUBLIC_PROJECT_ID",
  storageBucket: "process.env.EXPO_PUBLIC_STORAGE_BUCKET",
  messagingSenderId: "process.env.EXPO_PUBLIC_MESSAGE_IN_SENDER_ID",
  appId: "process.env.EXPO_PUBLIC_APP_ID",
  measurementId: "process.env.EXPO_PUBLIC_MEASUREMENT_ID",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
//const analytics = getAnalytics(FIREBASE_APP); // Corrected from app to FIREBASE_APP
