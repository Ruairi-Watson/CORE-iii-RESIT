// Protected route component for authenticated users
// Checks if user is logged in before allowing access
import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'

const ProtectedRoute = ({ children }) => {
  // Safely get authentication state
  let user
  try {
    const auth = useAuth()
    user = auth?.user
  } catch (error) {
    console.warn('Auth context not available in ProtectedRoute:', error)
    user = null
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Render protected content if authenticated
  return children
}

export default ProtectedRoute 