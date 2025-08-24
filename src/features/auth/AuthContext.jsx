// Authentication context provider for application-wide state management
// Manages user authentication state and session persistence across components
// Provides secure login, logout, and user data retrieval functions
import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  deleteUser
} from 'firebase/auth'
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase.js'

// Simplified authentication context - mock users removed

// Creates authentication context for component tree state sharing
const AuthContext = createContext()

/**
 * Custom hook providing access to authentication context throughout application
 * Returns authentication state and methods for component consumption
 * @returns {Object} - Authentication context containing user state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) { 
    // Context unavailable outside provider tree
  }
  return context
}

/**
 * Authentication provider component wrapping application components
 * Manages authentication state and provides context to child components
 * Handles Firebase integration and fallback authentication systems
 */
export const AuthProvider = ({ children }) => {
  // Current authenticated user state tracking
  const [user, setUser] = useState(null)
  
  // Authentication loading state for UI feedback
  const [loading, setLoading] = useState(true)
  
  // User role classification (admin or employee)
  const [userRole, setUserRole] = useState(null)
  
  // Employee access state (for code-based access without registration)
  const [employeeAccess, setEmployeeAccessState] = useState(null)

  // Firebase configuration validation check
  const isFirebaseConfigured = auth && auth.app && auth.app.options && auth.app.options.projectId

  /**
   * User authentication function with Firebase
   * Authenticates users with email and password credentials
   */
  const login = async (email, password) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase authentication not configured')
    }

    try {
      // Firebase authentication attempt with provided credentials
      const result = await signInWithEmailAndPassword(auth, email, password)
      
      // User role retrieval from Firestore user document
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
  const register = async (email, password, role = 'employee', department = '', organization = '') => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase authentication not configured')
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Use provided organization (company name) or default
      const userOrganization = organization || 'default-company'
      
      // Creates user document in Firestore with 4 point categories and organization
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        role,
        department,
        organization: userOrganization,
        createdAt: new Date(),
        points: {
          attendance: 0,
          collaboration: 0,
          efficiency: 0,
          innovation: 0,
          total: 0
        },
        achievements: []
      })
      
      setUserRole(role)
      return result
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // Deletes the current user account completely
  const deleteAccount = async () => {
    if (!user) {
      throw new Error('No user is currently logged in')
    }

    if (!isFirebaseConfigured) {
      // For mock users, just remove from session storage
      setUser(null)
      setUserRole(null)
      sessionStorage.removeItem('mockUser')
      sessionStorage.removeItem('mockUserRole')
      return Promise.resolve()
    }

    try {
      // First delete the user document from Firestore
      await deleteDoc(doc(db, 'users', user.uid))
      
      // Then delete the Firebase Auth user account
      await deleteUser(user)
      
      // Clear local state
      setUser(null)
      setUserRole(null)
      
    } catch (error) {
      console.error('Error deleting account:', error)
      throw error
    }
  }

  // Signs out current user
  const logout = () => {
    if (!isFirebaseConfigured) {
      setUser(null)
      setUserRole(null)
      setEmployeeAccessState(null)
      sessionStorage.removeItem('mockUser')
      sessionStorage.removeItem('mockUserRole')
      sessionStorage.removeItem('employeeAccess')
      return Promise.resolve()
    }

    setUser(null)
    setUserRole(null)
    setEmployeeAccessState(null)
    sessionStorage.removeItem('employeeAccess')
    return signOut(auth)
  }

  // Checks if current user is admin
  const isAdmin = () => {
    return userRole === 'admin'
  }

  // Mock user data function removed - no longer needed

  // Set employee access for code-based viewing
  const setEmployeeAccess = async (companyName, accessCode) => {
    const employeeData = {
      companyName,
      accessCode,
      role: 'employee',
      accessTime: new Date(),
      uid: `employee-${accessCode}-${Date.now()}`,
      email: `employee@${companyName.toLowerCase().replace(/\s+/g, '-')}.local`
    }
    
    setEmployeeAccessState(employeeData)
    setUser(employeeData)
    setUserRole('employee')
    
    // Store in sessionStorage for persistence
    sessionStorage.setItem('employeeAccess', JSON.stringify(employeeData))
    sessionStorage.setItem('mockUser', JSON.stringify(employeeData))
    sessionStorage.setItem('mockUserRole', 'employee')
    
    console.log('Employee access granted for company:', companyName)
  }

  // Clear employee access
  const clearEmployeeAccess = () => {
    setEmployeeAccessState(null)
    setUser(null)
    setUserRole(null)
    sessionStorage.removeItem('employeeAccess')
    sessionStorage.removeItem('mockUser')
    sessionStorage.removeItem('mockUserRole')
  }

  // Monitors authentication state changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Firebase not configured - using mock authentication')
      }
      
      // Check for existing mock session or employee access
      const savedUser = sessionStorage.getItem('mockUser')
      const savedRole = sessionStorage.getItem('mockUserRole')
      const savedEmployeeAccess = sessionStorage.getItem('employeeAccess')
      
      if (savedEmployeeAccess) {
        const employeeData = JSON.parse(savedEmployeeAccess)
        setEmployeeAccessState(employeeData)
        setUser(employeeData)
        setUserRole('employee')
      } else if (savedUser && savedRole) {
        setUser(JSON.parse(savedUser))
        setUserRole(savedRole)
      }
      
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
    employeeAccess,
    login,
    register,
    logout,
    deleteAccount,
    isAdmin,
    isFirebaseConfigured,
    setEmployeeAccess,
    clearEmployeeAccess
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
} 