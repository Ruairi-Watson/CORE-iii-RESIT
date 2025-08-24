// Unit tests for AuthContext
import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext.jsx'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  deleteUser: jest.fn()
}))

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  deleteDoc: jest.fn()
}))

// Firebase is mocked globally in setupTests.js

// Test component to consume the auth context
const TestConsumer = () => {
  const auth = useAuth()
  
  if (!auth) {
    return <div data-testid="no-auth">No auth context</div>
  }
  
  return (
    <div data-testid="auth-consumer">
      <div data-testid="user">{auth.user ? auth.user.email : 'No user'}</div>
      <div data-testid="role">{auth.userRole || 'No role'}</div>
      <div data-testid="loading">{auth.loading ? 'Loading' : 'Not loading'}</div>
      <button onClick={() => auth.login('test@test.com', 'password')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      }
    })
  })

  test('should provide auth context to children', () => {
    // Mock onAuthStateChanged to not call the callback
    onAuthStateChanged.mockImplementation(() => () => {})
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    
    expect(screen.getByTestId('auth-consumer')).toBeInTheDocument()
    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(screen.getByTestId('role')).toHaveTextContent('No role')
  })

  test('should handle user authentication state changes', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@test.com'
    }
    
    const mockUserDoc = {
      exists: () => true,
      data: () => ({ role: 'admin' })
    }
    
    // Mock Firebase auth state change
    onAuthStateChanged.mockImplementation((auth, callback) => {
      // Simulate user being authenticated
      setTimeout(() => callback(mockUser), 0)
      return () => {} // Unsubscribe function
    })
    
    getDoc.mockResolvedValue(mockUserDoc)
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com')
      expect(screen.getByTestId('role')).toHaveTextContent('admin')
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })
  })

  test('should handle login functionality', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@test.com'
    }
    
    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser })
    onAuthStateChanged.mockImplementation(() => () => {})
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    
    const loginButton = screen.getByText('Login')
    
    await act(async () => {
      loginButton.click()
    })
    
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@test.com',
      'password'
    )
  })

  test('should handle logout functionality', async () => {
    signOut.mockResolvedValue()
    onAuthStateChanged.mockImplementation(() => () => {})
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    
    const logoutButton = screen.getByText('Logout')
    
    await act(async () => {
      logoutButton.click()
    })
    
    expect(signOut).toHaveBeenCalledWith(expect.anything())
  })

  test('should handle user without role document', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@test.com'
    }
    
    const mockUserDoc = {
      exists: () => false,
      data: () => null
    }
    
    onAuthStateChanged.mockImplementation((auth, callback) => {
      setTimeout(() => callback(mockUser), 0)
      return () => {}
    })
    
    getDoc.mockResolvedValue(mockUserDoc)
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com')
      expect(screen.getByTestId('role')).toHaveTextContent('No role')
    })
  })

  test('should handle authentication errors', async () => {
    const error = new Error('Authentication failed')
    signInWithEmailAndPassword.mockRejectedValue(error)
    onAuthStateChanged.mockImplementation(() => () => {})
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    
    const loginButton = screen.getByText('Login')
    
    await act(async () => {
      loginButton.click()
    })
    
    expect(consoleSpy).toHaveBeenCalledWith('Login error:', error)
    
    consoleSpy.mockRestore()
  })

  test('should handle null user (logout)', async () => {
    onAuthStateChanged.mockImplementation((auth, callback) => {
      // Simulate user being logged out
      setTimeout(() => callback(null), 0)
      return () => {}
    })
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
      expect(screen.getByTestId('role')).toHaveTextContent('No role')
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })
  })

  test('should show loading state initially', () => {
    onAuthStateChanged.mockImplementation(() => () => {})
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
  })
})
