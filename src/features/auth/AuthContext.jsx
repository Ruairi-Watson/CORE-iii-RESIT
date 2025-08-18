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
import { auth, db } from '../../firebase.js'

// Mock test users for development
const MOCK_USERS = {
  'admin@core.com': {
    uid: 'admin-test-123',
    email: 'admin@core.com',
    password: 'admin123',
    role: 'admin',
    department: 'Management',
    points: {
      attendance: 95,
      collaboration: 88,
      efficiency: 92,
      innovation: 85,
      total: 360
    },
    achievements: ['Leadership Badge', 'Innovation Award']
  },
  'employee@core.com': {
    uid: 'employee-test-456',
    email: 'employee@core.com',
    password: 'employee123',
    role: 'employee',
    department: 'Engineering',
    points: {
      attendance: 82,
      collaboration: 78,
      efficiency: 85,
      innovation: 72,
      total: 317
    },
    achievements: ['Team Player', 'Efficiency Star']
  },
  'john.doe@core.com': {
    uid: 'john-test-789',
    email: 'john.doe@core.com',
    password: 'john123',
    role: 'employee',
    department: 'Sales',
    points: {
      attendance: 88,
      collaboration: 92,
      efficiency: 79,
      innovation: 85,
      total: 344
    },
    achievements: ['Sales Champion', 'Team Leader']
  }
}

// Creates authentication context
const AuthContext = createContext()

// Custom hook to access authentication context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) { 
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
  const isFirebaseConfigured = auth && auth.app && auth.app.options && auth.app.options.projectId

  // Mock login function for testing
  const mockLogin = async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check static mock users first
        let mockUser = MOCK_USERS[email]
        
        // If not found in static users, check dynamically created users
        if (!mockUser) {
          const dynamicUsers = JSON.parse(localStorage.getItem('mockUsers') || '{}')
          mockUser = dynamicUsers[email]
        }
        
        if (mockUser && mockUser.password === password) {
          const userData = {
            uid: mockUser.uid,
            email: mockUser.email,
            displayName: mockUser.email.split('@')[0]
          }
          setUser(userData)
          setUserRole(mockUser.role)
          
          // Store in localStorage for persistence
          localStorage.setItem('mockUser', JSON.stringify(userData))
          localStorage.setItem('mockUserRole', mockUser.role)
          
          resolve({ user: userData })
        } else {
          reject(new Error('Invalid credentials'))
        }
      }, 1000) // Simulate network delay
    })
  }

  // Signs in user with email and password
  const login = async (email, password) => {
    // Use mock authentication if Firebase is not configured
    if (!isFirebaseConfigured) {
      return mockLogin(email, password)
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

  // Mock registration function for testing
  const mockRegister = async (email, password, role = 'employee', department = '') => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '{}')
        if (existingUsers[email]) {
          reject(new Error('User already exists'))
          return
        }
        
        // Create new user
        const newUser = {
          uid: `${role}-${Date.now()}`,
          email,
          role,
          department,
          createdAt: new Date().toISOString(),
          points: {
            attendance: role === 'admin' ? 95 : Math.floor(Math.random() * 40) + 60,
            collaboration: role === 'admin' ? 88 : Math.floor(Math.random() * 40) + 60,
            efficiency: role === 'admin' ? 92 : Math.floor(Math.random() * 40) + 60,
            innovation: role === 'admin' ? 85 : Math.floor(Math.random() * 40) + 60,
            total: 0
          },
          achievements: role === 'admin' ? ['Leadership Badge', 'Innovation Award'] : []
        }
        
        // Calculate total points
        newUser.points.total = newUser.points.attendance + newUser.points.collaboration + 
                               newUser.points.efficiency + newUser.points.innovation
        
        // Store user data
        existingUsers[email] = { ...newUser, password }
        localStorage.setItem('mockUsers', JSON.stringify(existingUsers))
        
        // Update MOCK_USERS for login
        MOCK_USERS[email] = { ...newUser, password }
        
        resolve({ user: { uid: newUser.uid, email: newUser.email } })
      }, 1000)
    })
  }

  // Creates new user account
  const register = async (email, password, role = 'employee', department = '') => {
    // Use mock registration if Firebase is not configured
    if (!isFirebaseConfigured) {
      return mockRegister(email, password, role, department)
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Creates user document in Firestore with 4 point categories
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        role,
        department,
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

  // Signs out current user
  const logout = () => {
    if (!isFirebaseConfigured) {
      setUser(null)
      setUserRole(null)
      localStorage.removeItem('mockUser')
      localStorage.removeItem('mockUserRole')
      return Promise.resolve()
    }

    setUserRole(null)
    return signOut(auth)
  }

  // Checks if current user is admin
  const isAdmin = () => {
    return userRole === 'admin'
  }

  // Get mock user data for testing
  const getMockUserData = (email) => {
    return MOCK_USERS[email] || null
  }

  // Monitors authentication state changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn('Firebase not configured - using mock authentication')
      
      // Check for existing mock session
      const savedUser = localStorage.getItem('mockUser')
      const savedRole = localStorage.getItem('mockUserRole')
      
      if (savedUser && savedRole) {
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
    login,
    register,
    logout,
    isAdmin,
    isFirebaseConfigured,
    getMockUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
} 