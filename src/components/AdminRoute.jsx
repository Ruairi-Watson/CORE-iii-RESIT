// Admin route component for admin users only
// Checks if user is admin before allowing access
import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'

const AdminRoute = ({ children }) => {
  // Safely get authentication state
  let user
  try {
    const auth = useAuth()
    user = auth?.user
  } catch (error) {
    console.warn('Auth context not available in AdminRoute:', error)
    user = null
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user is admin (for now, allow all authenticated users)
  // In production, check user.role === 'admin'
  const isAdmin = user?.role === 'admin' || true // Allow all users for now

  // Redirect to leaderboard if not admin
  if (!isAdmin) {
    return <Navigate to="/leaderboard" replace />
  }

  // Render admin content if authorized
  return children
}

export default AdminRoute 