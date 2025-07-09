// Firebase configuration and initialisation
// Sets up Firebase app with auth, firestore, and storage services
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration object
// These values need to be replaced with actual Firebase project credentials
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}

// Check if Firebase is properly configured
const isConfigured = !Object.values(firebaseConfig).some(value => 
  typeof value === 'string' && value.includes('your-')
)

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