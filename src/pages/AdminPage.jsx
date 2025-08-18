// Admin page component
// Provides administrative functions for managing users, departments, and system settings
// Only accessible to users with admin role - Enhanced with 4 point categories
import React, { useState, useEffect } from 'react'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy 
} from 'firebase/firestore'
import { db } from '../firebase.js'

const AdminPage = () => {
  // Authentication and state management
  const { logout } = useAuth()
  
  // State for users and departments
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  
  // State for new user form
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'employee',
    department: '',
    points: {
      attendance: 0,
      collaboration: 0,
      efficiency: 0,
      innovation: 0,
      total: 0
    }
  })
  
  // State for new department form
  const [newDepartment, setNewDepartment] = useState('')
  
  // State for managing UI
  const [activeTab, setActiveTab] = useState('users')
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddDepartment, setShowAddDepartment] = useState(false)

  // Point categories configuration
  const pointCategories = {
    attendance: { name: 'Attendance', color: 'text-green-600', icon: '📅' },
    collaboration: { name: 'Collaboration', color: 'text-blue-600', icon: '🤝' },
    efficiency: { name: 'Efficiency', color: 'text-amber-600', icon: '⚡' },
    innovation: { name: 'Innovation', color: 'text-purple-600', icon: '💡' }
  }

  // Loads data when component mounts
  useEffect(() => {
    loadData()
  }, [])

  // Loads users and departments from Firestore
  const loadData = async () => {
    try {
      setLoading(true)
      
      // Loads users
      const usersQuery = query(collection(db, 'users'), orderBy('email'))
      const usersSnapshot = await getDocs(usersQuery)
      let usersData = usersSnapshot.docs.map(doc => {
        const data = doc.data()
        // Handle both old and new point structures
        if (typeof data.points === 'number') {
          return {
            id: doc.id,
            ...data,
            points: {
              attendance: 0,
              collaboration: 0,
              efficiency: 0,
              innovation: 0,
              total: data.points || 0
            }
          }
        }
        return {
          id: doc.id,
          ...data,
          points: {
            attendance: data.points?.attendance || 0,
            collaboration: data.points?.collaboration || 0,
            efficiency: data.points?.efficiency || 0,
            innovation: data.points?.innovation || 0,
            total: data.points?.total || 0
          }
        }
      })
      
      // Calculate total points if not already set
      usersData = usersData.map(user => ({
        ...user,
        points: {
          ...user.points,
          total: user.points.attendance + user.points.collaboration + user.points.efficiency + user.points.innovation
        }
      }))
      
      setUsers(usersData)
      
      // Loads departments
      const deptSnapshot = await getDocs(collection(db, 'departments'))
      const deptData = deptSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setDepartments(deptData)
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Adds a new user
  const addUser = async () => {
    try {
      const totalPoints = newUser.points.attendance + newUser.points.collaboration + newUser.points.efficiency + newUser.points.innovation
      await addDoc(collection(db, 'users'), {
        ...newUser,
        points: {
          ...newUser.points,
          total: totalPoints
        },
        createdAt: new Date(),
        achievements: []
      })
      setNewUser({
        email: '',
        role: 'employee',
        department: '',
        points: {
          attendance: 0,
          collaboration: 0,
          efficiency: 0,
          innovation: 0,
          total: 0
        }
      })
      setShowAddUser(false)
      loadData()
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

  // Adds a new department
  const addDepartment = async () => {
    try {
      await addDoc(collection(db, 'departments'), {
        name: newDepartment,
        createdAt: new Date()
      })
      setNewDepartment('')
      setShowAddDepartment(false)
      loadData()
    } catch (error) {
      console.error('Error adding department:', error)
    }
  }

  // Updates user points for a specific category
  const updateUserPoints = async (userId, category, newPoints) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return

      const updatedPoints = {
        ...user.points,
        [category]: parseInt(newPoints) || 0
      }
      
      // Calculate new total
      updatedPoints.total = updatedPoints.attendance + updatedPoints.collaboration + updatedPoints.efficiency + updatedPoints.innovation

      await updateDoc(doc(db, 'users', userId), {
        points: updatedPoints
      })
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, points: updatedPoints } : u
      ))
    } catch (error) {
      console.error('Error updating points:', error)
    }
  }

  // Deletes a user
  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId))
        loadData()
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  // Handles logout
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-[#4b3f2a] dark:text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Admin header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#4b3f2a] dark:text-white mb-2">
            Administration Panel
          </h1>
          <p className="text-[#8b7355] dark:text-gray-300">
            Manage users, departments, and point categories
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-[#f7c59f] text-[#4b3f2a]'
              : 'bg-white dark:bg-gray-800 text-[#8b7355] dark:text-gray-300 hover:bg-[#f7c59f]/20'
          }`}
        >
          👥 Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'departments'
              ? 'bg-[#f7c59f] text-[#4b3f2a]'
              : 'bg-white dark:bg-gray-800 text-[#8b7355] dark:text-gray-300 hover:bg-[#f7c59f]/20'
          }`}
        >
          🏢 Departments ({departments.length})
        </button>
      </div>

      {/* Users tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Add user button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#4b3f2a] dark:text-white">
              User Management
            </h2>
            <button
              onClick={() => setShowAddUser(true)}
              className="bg-[#f7c59f] hover:bg-[#f4b183] text-[#4b3f2a] font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Add User
            </button>
          </div>

          {/* Add user form */}
          {showAddUser && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-[#f7e7d7] dark:border-gray-700 space-y-4">
              <h3 className="text-lg font-semibold text-[#4b3f2a] dark:text-white">Add New User</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4b3f2a] dark:text-white mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-lg text-[#4b3f2a] dark:text-white dark:bg-gray-700"
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#4b3f2a] dark:text-white mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-lg text-[#4b3f2a] dark:text-white dark:bg-gray-700"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#4b3f2a] dark:text-white mb-1">Department</label>
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-lg text-[#4b3f2a] dark:text-white dark:bg-gray-700"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Point categories */}
              <div>
                <label className="block text-sm font-medium text-[#4b3f2a] dark:text-white mb-2">Initial Points</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(pointCategories).map(([key, category]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-[#8b7355] dark:text-gray-400 mb-1">
                        {category.icon} {category.name}
                      </label>
                      <input
                        type="number"
                        value={newUser.points[key]}
                        onChange={(e) => setNewUser({
                          ...newUser,
                          points: { ...newUser.points, [key]: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-lg text-[#4b3f2a] dark:text-white dark:bg-gray-700"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={addUser}
                  className="bg-[#f7c59f] hover:bg-[#f4b183] text-[#4b3f2a] font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Add User
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Enhanced users table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f7e7d7] dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-semibold">Role</th>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-semibold">Department</th>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-semibold">📅 Attendance</th>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-semibold">🤝 Collaboration</th>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-semibold">⚡ Efficiency</th>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-semibold">💡 Innovation</th>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-semibold">🏆 Total</th>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f7e7d7] dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#fdf6ee] dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-[#4b3f2a] dark:text-white">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#8b7355] dark:text-gray-300">{user.department || 'None'}</td>
                      
                      {/* Individual point category inputs */}
                      {Object.entries(pointCategories).map(([key, category]) => (
                        <td key={key} className="px-6 py-4">
                          <input
                            type="number"
                            value={user.points[key] || 0}
                            onChange={(e) => updateUserPoints(user.id, key, e.target.value)}
                            className={`w-20 px-2 py-1 border border-[#e9e4d7] dark:border-gray-600 rounded text-[#4b3f2a] dark:text-white dark:bg-gray-700 ${category.color}`}
                            min="0"
                          />
                        </td>
                      ))}
                      
                      {/* Total points (read-only) */}
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-[#4b3f2a] dark:text-white">
                          {user.points.total || 0}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Departments tab */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {/* Add department button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#4b3f2a] dark:text-white">
              Department Management
            </h2>
            <button
              onClick={() => setShowAddDepartment(true)}
              className="bg-[#f7c59f] hover:bg-[#f4b183] text-[#4b3f2a] font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Add Department
            </button>
          </div>

          {/* Add department form */}
          {showAddDepartment && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-[#f7e7d7] dark:border-gray-700 space-y-4">
              <h3 className="text-lg font-semibold text-[#4b3f2a] dark:text-white">Add New Department</h3>
              
              <div>
                <label className="block text-sm font-medium text-[#4b3f2a] dark:text-white mb-1">Department Name</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-lg text-[#4b3f2a] dark:text-white dark:bg-gray-700"
                  placeholder="Enter department name"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={addDepartment}
                  className="bg-[#f7c59f] hover:bg-[#f4b183] text-[#4b3f2a] font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Add Department
                </button>
                <button
                  onClick={() => setShowAddDepartment(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Departments grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-white dark:bg-gray-800 rounded-lg border border-[#f7e7d7] dark:border-gray-700 p-4">
                <h3 className="font-medium text-[#4b3f2a] dark:text-white">{dept.name}</h3>
                <p className="text-sm text-[#8b7355] dark:text-gray-400">
                  {users.filter(user => user.department === dept.name).length} employees
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage 