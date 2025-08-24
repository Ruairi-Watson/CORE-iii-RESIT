// Comprehensive unit tests for ProtectedRoute authentication guard component
// Verifies access control behaviour for authenticated and unauthenticated users
import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute.jsx'
import { useAuth } from '../../features/auth/AuthContext.jsx'

// Authentication context mock for controlled testing scenarios
// Replaces actual authentication state with predictable test values
jest.mock('../../features/auth/AuthContext.jsx', () => ({
  useAuth: jest.fn()
}))

// React Router navigation component mock for redirect testing
// Captures navigation attempts without actual routing behaviour
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, replace }) => (
    <div data-testid="navigate" data-to={to} data-replace={replace}>
      Redirecting to {to}
    </div>
  )
}))

// Helper function for rendering components within routing context
// Wraps test components with BrowserRouter for navigation testing
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ProtectedRoute', () => {
  // Mock child component for testing protected content rendering
  const mockChildren = <div data-testid="protected-content">Protected Content</div>

  // Reset all mocks before each test for isolation
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render children when user is authenticated', () => {
    // Mock authenticated user state with valid credentials
    useAuth.mockReturnValue({
      user: { uid: 'test-user', email: 'test@example.com' }
    })

    renderWithRouter(
      <ProtectedRoute>
        {mockChildren}
      </ProtectedRoute>
    )

    // Verify protected content renders for authenticated users
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    // Ensure no navigation redirect occurs
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })

  test('should redirect to home when user is not authenticated', () => {
    // Mock unauthenticated state with null user
    useAuth.mockReturnValue({
      user: null
    })

    renderWithRouter(
      <ProtectedRoute>
        {mockChildren}
      </ProtectedRoute>
    )

    // Verify protected content does not render
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    // Confirm navigation redirect is triggered
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    // Verify redirect destination is home page
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/')
    // Ensure redirect replaces current history entry
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-replace', 'true')
  })

  test('should redirect when useAuth returns undefined user', () => {
    // Mock authentication state with undefined user value
    useAuth.mockReturnValue({
      user: undefined
    })

    renderWithRouter(
      <ProtectedRoute>
        {mockChildren}
      </ProtectedRoute>
    )

    // Verify protected content remains hidden
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    // Confirm redirect behaviour for undefined user state
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
      <ProtectedRoute>
        {mockChildren}
      </ProtectedRoute>
    )

    // Verify graceful degradation without content rendering
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    // Confirm redirect occurs despite authentication error
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    // Verify error logging for debugging purposes
    expect(consoleSpy).toHaveBeenCalledWith(
      'Auth context not available in ProtectedRoute:',
      expect.any(Error)
    )

    // Clean up console spy after test completion
    consoleSpy.mockRestore()
  })

  test('should redirect when auth context returns null', () => {
    // Mock completely null authentication context
    useAuth.mockReturnValue(null)

    renderWithRouter(
      <ProtectedRoute>
        {mockChildren}
      </ProtectedRoute>
    )

    // Verify protected content remains inaccessible
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    // Confirm redirect behaviour for null context
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
  })

  test('should handle truthy user objects correctly', () => {
    // Mock comprehensive user object with multiple properties
    useAuth.mockReturnValue({
      user: { uid: 'test-user', email: 'test@example.com', displayName: 'Test User' }
    })

    renderWithRouter(
      <ProtectedRoute>
        {mockChildren}
      </ProtectedRoute>
    )

    // Verify protected content renders for complete user objects
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })
})
