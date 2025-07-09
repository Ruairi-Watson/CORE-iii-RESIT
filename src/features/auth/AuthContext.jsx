// Authentication context provider
// Manages user authentication state throughout the application
// Provides login, logout, and user data functions
import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../config/firebase.js'

// Creates authentication context
const AuthContext = createContext()

// Custom hook to access authentication context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Authentication provider component
export const AuthProvider = ({ children }) => {
  // Tracks current user state
  const [user, setUser] = useState(null)
  
  // Tracks loading state during authentication
  const [loading, setLoading] = useState(true)
  
  // Tracks user role (admin or employee)
  const [userRole, setUserRole] = useState(null)

  // Check if Firebase is configured
  const isFirebaseConfigured = auth && typeof auth.onAuthStateChanged === 'function'

  // Signs in user with email and password
  const login = async (email, password) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.')
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      
      // Retrieves user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role)
      }
      
      return result
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Creates new user account
  const register = async (email, password, role = 'employee', department = '') => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.')
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Creates user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        role,
        department,
        createdAt: new Date(),
        points: 0,
        achievements: []
      })
      
      setUserRole(role)
      return result
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // Signs out current user
  const logout = () => {
    if (!isFirebaseConfigured) {
      setUser(null)
      setUserRole(null)
      return Promise.resolve()
    }

    setUserRole(null)
    return signOut(auth)
  }

  // Checks if current user is admin
  const isAdmin = () => {
    return userRole === 'admin'
  }

  // Monitors authentication state changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn('Firebase not configured - authentication disabled')
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        
        // Retrieves user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role)
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [isFirebaseConfigured])

  // Context values provided to children
  const value = {
    user,
    userRole,
    login,
    register,
    logout,
    isAdmin,
    isFirebaseConfigured
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
} 