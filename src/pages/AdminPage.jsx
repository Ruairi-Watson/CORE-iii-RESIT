// Admin page component
// Provides administrative functions for managing users, departments, and system settings
// Only accessible to users with admin role
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
import { db } from '../config/firebase.js'

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
    points: 0
  })
  
  // State for new department form
  const [newDepartment, setNewDepartment] = useState('')
  
  // State for managing UI
  const [activeTab, setActiveTab] = useState('users')
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddDepartment, setShowAddDepartment] = useState(false)

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
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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

  // Adds new user to the system
  const handleAddUser = async (e) => {
    e.preventDefault()
    
    try {
      await addDoc(collection(db, 'users'), {
        ...newUser,
        createdAt: new Date(),
        achievements: []
      })
      
      setNewUser({ email: '', role: 'employee', department: '', points: 0 })
      setShowAddUser(false)
      loadData()
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

  // Adds new department
  const handleAddDepartment = async (e) => {
    e.preventDefault()
    
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

  // Updates user points
  const updateUserPoints = async (userId, newPoints) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        points: parseInt(newPoints)
      })
      loadData()
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
    <div className="max-w-6xl mx-auto">
      {/* Admin header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#4b3f2a] dark:text-white mb-2">
            Administration Panel
          </h1>
          <p className="text-[#8b7355] dark:text-gray-300">
            Manage users, departments, and system settings
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
      <div className="flex space-x-1 mb-8 bg-[#f7e7d7] dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'users' 
              ? 'bg-white dark:bg-gray-700 text-[#4b3f2a] dark:text-white shadow-sm' 
              : 'text-[#8b7355] dark:text-gray-400 hover:text-[#4b3f2a] dark:hover:text-white'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'departments' 
              ? 'bg-white dark:bg-gray-700 text-[#4b3f2a] dark:text-white shadow-sm' 
              : 'text-[#8b7355] dark:text-gray-400 hover:text-[#4b3f2a] dark:hover:text-white'
          }`}
        >
          Departments
        </button>
      </div>

      {/* Users tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Add user button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#4b3f2a] dark:text-white">
              Users ({users.length})
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
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-[#f7e7d7] dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-[#4b3f2a] dark:text-white mb-4">Add New User</h3>
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
                <input
                  type="text"
                  placeholder="Department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  className="px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Initial Points"
                  value={newUser.points}
                  onChange={(e) => setNewUser({...newUser, points: parseInt(e.target.value) || 0})}
                  className="px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <div className="md:col-span-2 flex gap-2">
                  <button
                    type="submit"
                    className="bg-[#f7c59f] hover:bg-[#f4b183] text-[#4b3f2a] font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Add User
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-[#f7e7d7] dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f7e7d7] dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-medium">Email</th>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-medium">Role</th>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-medium">Department</th>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-medium">Points</th>
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-medium">Actions</th>
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
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={user.points || 0}
                          onChange={(e) => updateUserPoints(user.id, e.target.value)}
                          className="w-20 px-2 py-1 border border-[#e9e4d7] dark:border-gray-600 rounded text-[#4b3f2a] dark:text-white dark:bg-gray-700"
                        />
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
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#4b3f2a] dark:text-white">
              Departments ({departments.length})
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
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-[#f7e7d7] dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-[#4b3f2a] dark:text-white mb-4">Add New Department</h3>
              <form onSubmit={handleAddDepartment} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Department Name"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#f7c59f] hover:bg-[#f4b183] text-[#4b3f2a] font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDepartment(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </form>
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