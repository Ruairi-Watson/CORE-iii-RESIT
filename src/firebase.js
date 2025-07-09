// Firebase configuration and initialisation
// Provides authentication, Firestore database, and storage
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase project configuration - temporarily hard-coded for testing
const firebaseConfig = {
  apiKey: "AIzaSyBG4L1Z7ISD7fPgYE1LNVCmiPZWVYT_Knc",
  authDomain: "core-iii-resub.firebaseapp.com",
  projectId: "core-iii-resub",
  storageBucket: "core-iii-resub.firebasestorage.app",
  messagingSenderId: "702151129291",
  appId: "1:702151129291:web:c4a5b2c9b14a79358b034e"
};

// Debug: log the config to see what values are loaded
console.log('Firebase config loaded:', firebaseConfig);

// Initialises Firebase app
const app = initializeApp(firebaseConfig);

// Provides authentication service
export const auth = getAuth(app);
// Provides Firestore database service
export const db = getFirestore(app);
// Provides storage service
export const storage = getStorage(app);

export default app; 