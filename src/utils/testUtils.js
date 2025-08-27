// Testing utilities
import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../features/auth/AuthContext.jsx'
import { LeaderboardProvider } from '../features/leaderboard/LeaderboardContext.jsx'

// Mock auth provider
const MockAuthProvider = ({ children, mockUser = null, mockRole = null }) => {

  const mockAuthValue = {
    user: mockUser,
    userRole: mockRole,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    employeeAccess: null,
    setEmployeeAccess: jest.fn()
  }

  // Simple wrapper element with test identifier for verification
  return React.createElement('div', { 'data-testid': 'mock-auth-provider' }, children)
}

// Mock leaderboard context provider for employee data testing
// Simulates leaderboard functionality without external dependencies
const MockLeaderboardProvider = ({ children }) => {
  // Standard leaderboard context interface mock
  const mockLeaderboardValue = {
    employees: [],
    loading: false,
    error: null,
    refreshLeaderboard: jest.fn(),
    addEmployee: jest.fn(),
    updateEmployee: jest.fn(),
    deleteEmployee: jest.fn()
  }

  // Simple wrapper element with test identifier
  return React.createElement('div', { 'data-testid': 'mock-leaderboard-provider' }, children)
}

// Enhanced render function with essential React context providers
// Wraps components with necessary providers for comprehensive testing
export const renderWithProviders = (
  component, 
  { 
    mockUser = null, 
    mockRole = null, 
    initialRoute = '/' 
  } = {}
) => {
  // Composite wrapper component with routing and context providers
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <MockAuthProvider mockUser={mockUser} mockRole={mockRole}>
        <MockLeaderboardProvider>
          {children}
        </MockLeaderboardProvider>
      </MockAuthProvider>
    </BrowserRouter>
  )

  // Standard React Testing Library render with custom wrapper
  return render(component, { wrapper: Wrapper })
}

// Standardised mock user objects for authentication testing scenarios
// Provides consistent user data structures across different test cases
export const mockUsers = {
  // Standard employee user profile
  employee: {
    uid: 'test-employee-id',
    email: 'employee@test.com',
    displayName: 'Test Employee'
  },
  // Administrator user profile with elevated permissions
  admin: {
    uid: 'test-admin-id',
    email: 'admin@test.com',
    displayName: 'Test Admin'
  }
}

// Comprehensive mock employee dataset for leaderboard testing
// Represents typical employee records with performance metrics and achievements
export const mockEmployees = [
  {
    id: '1',
    name: 'John Doe',
    department: 'Engineering',
    performanceScore: 85,
    totalPoints: 1200,
    achievements: ['Team Player', 'Innovation Award']
  },
  {
    id: '2',
    name: 'Jane Smith',
    department: 'Marketing',
    performanceScore: 92,
    totalPoints: 1500,
    achievements: ['Sales Champion', 'Customer Focus']
  },
  {
    id: '3',
    name: 'Bob Johnson',
    department: 'Design',
    performanceScore: 78,
    totalPoints: 980,
    achievements: ['Creative Excellence']
  }
]
