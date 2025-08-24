// Comprehensive unit tests for AdminRoute authorisation guard component
// Validates administrator access control and appropriate redirect behaviour
import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AdminRoute from '../AdminRoute.jsx'
import { useAuth } from '../../features/auth/AuthContext.jsx'

// Authentication context mock for administrator privilege testing
// Enables controlled simulation of various user role scenarios
jest.mock('../../features/auth/AuthContext.jsx', () => ({
  useAuth: jest.fn()
}))

// React Router navigation mock for redirect path verification
// Captures navigation destinations without triggering actual routing
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, replace }) => (
    <div data-testid="navigate" data-to={to} data-replace={replace}>
      Redirecting to {to}
    </div>
  )
}))

// Helper function for rendering components within routing context
// Provides BrowserRouter wrapper for navigation testing scenarios
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('AdminRoute', () => {
  // Mock administrative content for testing protected rendering
  const mockChildren = <div data-testid="admin-content">Admin Content</div>

  // Clear all mocks before each test for consistent state
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render children when user is authenticated admin', () => {
    // Mock authenticated administrator with valid credentials and role
    useAuth.mockReturnValue({
      user: { uid: 'admin-user', email: 'admin@example.com' },
      userRole: 'admin'
    })

    renderWithRouter(
      <AdminRoute>
        {mockChildren}
      </AdminRoute>
    )

    // Verify administrative content renders for authorised users
    expect(screen.getByTestId('admin-content')).toBeInTheDocument()
    // Ensure no navigation redirect occurs for valid admins
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })

  test('should redirect to home when user is not authenticated', () => {
    // Mock completely unauthenticated state
    useAuth.mockReturnValue({
      user: null,
      userRole: null
    })

    renderWithRouter(
      <AdminRoute>
        {mockChildren}
      </AdminRoute>
    )

    // Verify administrative content remains inaccessible
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    // Confirm navigation redirect is triggered
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    // Verify redirect destination is home page for unauthenticated users
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/')
  })

  test('should redirect when user is authenticated but not admin', () => {
    // Mock authenticated user with insufficient privileges
    useAuth.mockReturnValue({
      user: { uid: 'regular-user', email: 'user@example.com' },
      userRole: 'employee'
    })

    renderWithRouter(
      <AdminRoute>
        {mockChildren}
      </AdminRoute>
    )

    // Verify administrative content remains protected
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    // Confirm navigation redirect occurs for non-admin users
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    // Verify redirect destination is leaderboard for authenticated non-admins
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/leaderboard')
  })

  test('should redirect when userRole is null even with authenticated user', () => {
    // Mock authenticated user without assigned role
    useAuth.mockReturnValue({
      user: { uid: 'user-id', email: 'user@example.com' },
      userRole: null
    })

    renderWithRouter(
      <AdminRoute>
        {mockChildren}
      </AdminRoute>
    )

    // Verify administrative access denied for users without roles
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    // Confirm redirect occurs for null role state
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
  })

  test('should redirect when userRole is undefined', () => {
    // Mock authenticated user with undefined role property
    useAuth.mockReturnValue({
      user: { uid: 'user-id', email: 'user@example.com' },
      userRole: undefined
    })

    renderWithRouter(
      <AdminRoute>
        {mockChildren}
      </AdminRoute>
    )

    // Verify access denial for undefined role values
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    // Confirm navigation redirect for undefined role state
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
  })

  test('should handle auth context errors gracefully', () => {
    // Mock authentication context error scenario
    useAuth.mockImplementation(() => {
      throw new Error('Auth context error')
    })

    // Spy on console warnings for error handling verification
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    renderWithRouter(
      <AdminRoute>
        {mockChildren}
      </AdminRoute>
    )

    // Verify graceful degradation without content rendering
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    // Confirm redirect occurs despite authentication error
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    // Verify error logging for debugging purposes
    expect(consoleSpy).toHaveBeenCalledWith(
      'Auth context not available in AdminRoute:',
      expect.any(Error)
    )

    // Clean up console spy after test completion
    consoleSpy.mockRestore()
  })

  test('should handle case-sensitive admin role correctly', () => {
    // Mock user with incorrectly capitalised admin role
    useAuth.mockReturnValue({
      user: { uid: 'admin-user', email: 'admin@example.com' },
      userRole: 'Admin' // Different case from expected 'admin'
    })

    renderWithRouter(
      <AdminRoute>
        {mockChildren}
      </AdminRoute>
    )

    // Verify case-sensitive role validation denies access
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    // Confirm redirect occurs for case mismatch
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
  })

  test('should handle empty string userRole', () => {
    // Mock user with empty string role value
    useAuth.mockReturnValue({
      user: { uid: 'user-id', email: 'user@example.com' },
      userRole: ''
    })

    renderWithRouter(
      <AdminRoute>
        {mockChildren}
      </AdminRoute>
    )

    // Verify empty string role is treated as invalid
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    // Confirm redirect behaviour for empty role string
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
  })
})
