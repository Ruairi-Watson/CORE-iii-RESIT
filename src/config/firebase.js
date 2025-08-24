// Firebase configuration and initialisation
// Sets up Firebase app with auth, firestore, and storage services
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration object
// Uses environment variables for security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBG4L1Z7ISD7fPgYE1LNVCmiPZWVYT_Knc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "core-iii-resub.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "core-iii-resub",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "core-iii-resub.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "702151129291",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:702151129291:web:c4a5b2c9b14a79358b034e"
}

// Check if Firebase is properly configured
const isConfigured = firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('your-') &&
  !firebaseConfig.authDomain.includes('your-')



let app, auth, db, storage

if (isConfigured) {
  // Initialise Firebase app with configuration
  app = initializeApp(firebaseConfig)
  
  // Export authentication service
  auth = getAuth(app)
  
  // Export Firestore database service
  db = getFirestore(app)
  
  // Export cloud storage service
  storage = getStorage(app)
} else {
  // Mock services for development when Firebase isn't configured
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      // Call the callback immediately with null user to set loading to false
      setTimeout(() => callback(null), 0)
      // Return unsubscribe function
      return () => {}
    },
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    signOut: () => Promise.resolve(),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured'))
  }
  
  db = {
    collection: () => ({
      getDocs: () => Promise.resolve({ docs: [] }),
      addDoc: () => Promise.reject(new Error('Firebase not configured')),
      orderBy: () => ({ getDocs: () => Promise.resolve({ docs: [] }) })
    })
  }
  
  storage = {}
}

export { auth, db, storage }
export default app 