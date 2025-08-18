// Firebase configuration and initialisation
// Sets up Firebase app with auth, firestore, and storage services
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration object
// Your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyBG4L1Z7ISD7fPgYE1LNVCmiPZWVYT_Knc",
  authDomain: "core-iii-resub.firebaseapp.com",
  projectId: "core-iii-resub",
  storageBucket: "core-iii-resub.firebasestorage.app",
  messagingSenderId: "702151129291",
  appId: "1:702151129291:web:c4a5b2c9b14a79358b034e"
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