// Admin route component for admin users only
// Checks if user is admin before allowing access
import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'

const AdminRoute = ({ children }) => {
  // Safely get authentication state
  let user, userRole
  try {
    const auth = useAuth()
    user = auth?.user
    userRole = auth?.userRole
  } catch (error) {
    console.warn('Auth context not available in AdminRoute:', error)
    user = null
    userRole = null
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user is admin - STRICT CHECKING
  const isAdmin = userRole === 'admin'

  // Redirect to leaderboard if not admin
  if (!isAdmin) {
    return <Navigate to="/leaderboard" replace />
  }

  // Render admin content if authorized
  return children
}

export default AdminRoute 