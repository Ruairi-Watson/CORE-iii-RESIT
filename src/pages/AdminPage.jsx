// Administrative management page component for system oversight
// Provides comprehensive user and department management capabilities
// Restricted to authenticated administrative users with proper role verification
// Enhanced with four-category performance tracking system
// Note: Admin users are excluded from leaderboard participation automatically
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  query,
  orderBy,
  where,
  onSnapshot 
} from 'firebase/firestore'
import { db } from '../firebase.js'

const AdminPage = () => {
  // Navigation and authentication hooks
  const navigate = useNavigate()
  const { logout, deleteAccount, isAdmin, user } = useAuth()
  
  // State for users and departments
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [companyCode, setCompanyCode] = useState('')


  
  // State for new user form
  const [newUser, setNewUser] = useState({
    name: '',
    role: '',
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
  
  // State for quick department creation from user form
  const [quickDepartment, setQuickDepartment] = useState('')
  
  // State for managing UI
  const [activeTab, setActiveTab] = useState('users')
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddDepartment, setShowAddDepartment] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)

  // Point categories configuration
  const pointCategories = {
    attendance: { name: 'Attendance', color: 'text-green-600', icon: '📅' },
    collaboration: { name: 'Collaboration', color: 'text-blue-600', icon: '🤝' },
    efficiency: { name: 'Efficiency', color: 'text-amber-600', icon: '⚡' },
    innovation: { name: 'Innovation', color: 'text-purple-600', icon: '💡' }
  }

  // Sets up real-time listeners when component mounts
  useEffect(() => {
    setupRealtimeListeners()
    
    // Cleanup listeners on unmount
    return () => {
      if (window.adminPageUnsubscribers) {
        window.adminPageUnsubscribers.unsubscribeUsers?.()
        window.adminPageUnsubscribers.unsubscribeDepartments?.()
        delete window.adminPageUnsubscribers
        console.log('Real-time listeners cleaned up')
      }
    }
  }, [])

  // Sets up real-time listeners for users and departments - Admin only
  const setupRealtimeListeners = async () => {
    try {
      setLoading(true)
      
      // Security check: Only admins can load all user data
      if (!isAdmin()) {
        console.error('Unauthorised access attempt to load all users')
        setLoading(false)
        return
      }

      // Get current user's organization with fallback
      let currentUserOrg = 'core-demo' // Default fallback
      
      try {
        const currentUserDoc = await getDoc(doc(db, 'users', user.uid))
        if (currentUserDoc.exists() && currentUserDoc.data().organization) {
          currentUserOrg = currentUserDoc.data().organization
        }
      } catch (orgError) {
        console.log('Error getting user organization, using default:', orgError)
      }

      // One-time fix for users missing organization field
      const allUsersSnapshot = await getDocs(collection(db, 'users'))
      let fixedCount = 0
      for (const doc of allUsersSnapshot.docs) {
        const data = doc.data()
        if (!data.organization && data.email && data.email.trim()) {
          // Assign organization based on email domain
          const orgFromEmail = data.email.split('@')[1].replace(/\./g, '-')
          await updateDoc(doc.ref, { organization: orgFromEmail })
          fixedCount++
          console.log(`Fixed organization for user: ${data.email} (assigned: ${orgFromEmail})`)
        }
      }
      if (fixedCount > 0) {
        console.log(`Auto-fixed ${fixedCount} users missing organization field`)
      }
      
      // Set up real-time listener for users
      const usersQuery = query(collection(db, 'users'), where('organization', '==', currentUserOrg))
      const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        console.log('Real-time users update received')
        let usersData = snapshot.docs.map(doc => {
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
        
        // Add mock users if they exist (for development environment)
        if (process.env.NODE_ENV === 'development') {
          try {
            const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '{}')
            const mockUserArray = Object.values(mockUsers).map(mockUser => ({
              id: mockUser.uid,
              email: mockUser.email,
              role: mockUser.role,
              department: mockUser.department,
              organization: mockUser.organization,
              points: mockUser.points || {
                attendance: 0,
                collaboration: 0,
                efficiency: 0,
                innovation: 0,
                total: 0
              },
              achievements: mockUser.achievements || [],
              isMockUser: true // Flag to identify mock users
            })).filter(mockUser => mockUser.organization === currentUserOrg)
            
            console.log(`Found ${mockUserArray.length} mock users for organization: ${currentUserOrg}`)
            usersData = [...usersData, ...mockUserArray]
          } catch (error) {
            console.log('No mock users found or error loading them:', error)
          }
        }
        
        // Sort users by email on client side
        usersData.sort((a, b) => a.email.localeCompare(b.email))
        
        setUsers(usersData)
        setLoading(false)
      }, (error) => {
        console.error('Error with users real-time listener:', error)
        setLoading(false)
      })
      
      // Set up real-time listener for departments
      const deptQuery = query(collection(db, 'departments'), where('organization', '==', currentUserOrg))
      const unsubscribeDepartments = onSnapshot(deptQuery, async (snapshot) => {
        console.log('Real-time departments update received')
        let deptData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // If no departments found, create default ones for this organization
        if (deptData.length === 0) {
          console.log('No departments found, creating defaults for organization:', currentUserOrg)
          const defaultDepts = ['Engineering', 'Sales', 'Marketing']
          
          // Check existing departments in Firestore to avoid duplicates
          const existingDepts = await getDocs(query(collection(db, 'departments'), where('organization', '==', currentUserOrg)))
          const existingNames = new Set(existingDepts.docs.map(doc => doc.data().name))
          
          for (const deptName of defaultDepts) {
            if (!existingNames.has(deptName)) {
              await addDoc(collection(db, 'departments'), {
                name: deptName,
                organization: currentUserOrg,
                createdAt: new Date()
              })
              console.log(`Created default department: ${deptName}`)
            } else {
              console.log(`Department ${deptName} already exists, skipping`)
            }
          }
          // The listener will automatically update when the new departments are added
        } else {
          setDepartments(deptData)
        }
      }, (error) => {
        console.error('Error with departments real-time listener:', error)
        // Fallback to default departments if Firebase fails
        setDepartments([
          { id: '1', name: 'Engineering', organization: currentUserOrg },
          { id: '2', name: 'Sales', organization: currentUserOrg },
          { id: '3', name: 'Marketing', organization: currentUserOrg }
        ])
      })

      // Store unsubscribe functions for cleanup
      window.adminPageUnsubscribers = { unsubscribeUsers, unsubscribeDepartments }
      
      // Fetch company access code
      await fetchCompanyCode(currentUserOrg)
      
    } catch (error) {
      console.error('Error setting up real-time listeners:', error)
      setLoading(false)
      // Emergency fallback: ensure departments are never empty
      setDepartments([
        { id: '1', name: 'Engineering', organization: 'core-demo' },
        { id: '2', name: 'Sales', organization: 'core-demo' },
        { id: '3', name: 'Marketing', organization: 'core-demo' }
      ])
    }
  }

  // Fetches company access code for current organization
  const fetchCompanyCode = async (organization) => {
    try {
      // Query company codes by organization/company name
      const codesQuery = query(
        collection(db, 'companyCodes'), 
        where('companyName', '==', organization),
        where('isActive', '==', true)
      )
      const codesSnapshot = await getDocs(codesQuery)
      
      if (!codesSnapshot.empty) {
        const codeDoc = codesSnapshot.docs[0]
        const codeData = codeDoc.data()
        setCompanyCode(codeData.code)
        console.log('Found company code:', codeData.code)
      } else {
        console.log('No active company code found for organization:', organization)
        setCompanyCode('')
      }
    } catch (error) {
      console.error('Error fetching company code:', error)
      setCompanyCode('')
    }
  }

  // Adds a new user - Admin only
  const addUser = async () => {
    // Security check: Only admins can add users
    if (!isAdmin()) {
      console.error('Unauthorised access attempt to add user')
      alert('Only administrators can add users')
      return
    }

    // Validation checks
    if (!newUser.name || !newUser.name.trim()) {
      alert('Please enter the user\'s name')
      return
    }

    if (!newUser.role || !newUser.role.trim()) {
      alert('Please enter a role/job title')
      return
    }

    if (!newUser.department || !newUser.department.trim()) {
      alert('Please select or create a department')
      return
    }

    try {
      console.log('Adding user:', newUser)
      
      // Using real Firebase configuration
      
      // Get current admin's organization with fallback
      let currentUserOrg = 'core-demo' // Default fallback
      
      try {
        const currentUserDoc = await getDoc(doc(db, 'users', user.uid))
        if (currentUserDoc.exists() && currentUserDoc.data().organization) {
          currentUserOrg = currentUserDoc.data().organization
        }
      } catch (orgError) {
        console.log('Could not get user organization for adding user, using default:', orgError)
      }
      
      console.log('Using organization for new user:', currentUserOrg)
      
      const totalPoints = newUser.points.attendance + newUser.points.collaboration + newUser.points.efficiency + newUser.points.innovation
      
      // No email needed for admin-created users
      const userToAdd = {
        ...newUser,
        organization: currentUserOrg, // Add user to same organization as admin
        points: {
          ...newUser.points,
          total: totalPoints
        },
        createdAt: new Date(),
        achievements: [],
        isAdminCreated: true // Flag to distinguish admin-created from self-registered
      }
      
      console.log('User data to add:', userToAdd)
      
      await addDoc(collection(db, 'users'), userToAdd)
      
      console.log('User added successfully')
      console.log('Added user data:', userToAdd)
      alert('User added successfully! Note: Users in Management/HR departments will not appear on the leaderboard to maintain competitive fairness.')
      
      setNewUser({
        name: '',
        role: '',
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
      // Real-time listener will automatically update the users list
      
      // Optional: Provide guidance about leaderboard visibility
      setTimeout(() => {
        const hasAdminRole = ['admin', 'administrator', 'manager', 'director', 'supervisor', 'head of', 'chief', 'executive'].some(term => 
          userToAdd.role.toLowerCase().includes(term)
        )
        const hasExcludedDept = ['management', 'hr', 'human resources', 'admin', 'administration'].includes(userToAdd.department.toLowerCase())
        
        if (!hasAdminRole && !hasExcludedDept) {
          console.log('User should be visible on leaderboard')
        } else {
          console.log('User will be filtered out from leaderboard due to role/department restrictions')
        }
      }, 1000)
    } catch (error) {
      console.error('Error adding user:', error)
      alert(`Error adding user: ${error.message}`)
    }
  }

  // Adds a new department
  const addDepartment = async () => {
    // Validation check
    if (!newDepartment.trim()) {
      alert('Please enter a department name')
      return
    }

    // Check if department already exists
    const existingDept = departments.find(dept => dept.name.toLowerCase() === newDepartment.toLowerCase())
    if (existingDept) {
      alert('Department already exists!')
      return
    }

    try {
      console.log('Adding department:', newDepartment)
      
      // Using real Firebase configuration

      // Get current admin's organization with fallback
      let currentUserOrg = 'core-demo' // Default fallback
      
      try {
        const currentUserDoc = await getDoc(doc(db, 'users', user.uid))
        if (currentUserDoc.exists() && currentUserDoc.data().organization) {
          currentUserOrg = currentUserDoc.data().organization
        }
      } catch (orgError) {
        console.log('Could not get user organization, using default:', orgError)
      }
      
      console.log('Using organization:', currentUserOrg)
      
      await addDoc(collection(db, 'departments'), {
        name: newDepartment,
        organization: currentUserOrg, // Add department to same organization as admin
        createdAt: new Date()
      })
      
      console.log('Department added successfully')
      alert('Department added successfully!')
      
      setNewDepartment('')
      setShowAddDepartment(false)
      
      // Real-time listener will automatically update the departments list
    } catch (error) {
      console.error('Error adding department:', error)
      alert(`Error adding department: ${error.message}`)
    }
  }

  // Quickly adds a new department from the user form
  const addQuickDepartment = async () => {
    if (!quickDepartment.trim()) return
    
    // Check if department already exists
    const existingDept = departments.find(dept => dept.name.toLowerCase() === quickDepartment.toLowerCase())
    if (existingDept) {
      alert('Department already exists!')
      return
    }
    
    try {
      console.log('Adding quick department:', quickDepartment)
      
      // Using real Firebase configuration

      // Get current admin's organization with fallback
      let currentUserOrg = 'core-demo' // Default fallback
      
      try {
        const currentUserDoc = await getDoc(doc(db, 'users', user.uid))
        if (currentUserDoc.exists() && currentUserDoc.data().organization) {
          currentUserOrg = currentUserDoc.data().organization
        }
      } catch (orgError) {
        console.log('Could not get user organization for quick department, using default:', orgError)
      }
      
      console.log('Using organization for quick department:', currentUserOrg)
      
      await addDoc(collection(db, 'departments'), {
        name: quickDepartment,
        organization: currentUserOrg,
        createdAt: new Date()
      })
      
      console.log('Quick department added successfully')
      
      // Auto-select the new department for the user
      setNewUser({ ...newUser, department: quickDepartment })
      setQuickDepartment('')
      
      // Real-time listener will automatically update the departments list
    } catch (error) {
      console.error('Error adding quick department:', error)
      alert(`Error adding quick department: ${error.message}`)
    }
  }

  // Updates user points for a specific category
  const updateUserPoints = async (userId, category, newPoints) => {
    // Security check: Only admins can update user points
    if (!isAdmin()) {
      console.error('Unauthorised access attempt to update user points')
      return
    }
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
        // Real-time listener will automatically update the users list
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

  // Handles account deletion
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount()
      navigate('/')
    } catch (error) {
      console.error('Delete account error:', error)
      alert('Failed to delete account. Please try again.')
    }
  }

  // Cleans up duplicate departments
  const cleanupDuplicateDepartments = async () => {
    if (!isAdmin()) {
      console.error('Unauthorised access attempt to cleanup departments')
      return
    }

    try {
      // Get current user's organization
      let currentUserOrg = 'core-demo'
      const currentUserDoc = await getDoc(doc(db, 'users', user.uid))
      if (currentUserDoc.exists() && currentUserDoc.data().organization) {
        currentUserOrg = currentUserDoc.data().organization
      }

      // Get all departments for this organization
      const deptSnapshot = await getDocs(query(collection(db, 'departments'), where('organization', '==', currentUserOrg)))
      const allDepts = deptSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Group by name (case-insensitive)
      const deptsByName = {}
      allDepts.forEach(dept => {
        const normalizedName = dept.name.toLowerCase()
        if (!deptsByName[normalizedName]) {
          deptsByName[normalizedName] = []
        }
        deptsByName[normalizedName].push(dept)
      })

      // Find and delete duplicates (keep the first one)
      let deletedCount = 0
      for (const [name, depts] of Object.entries(deptsByName)) {
        if (depts.length > 1) {
          console.log(`Found ${depts.length} duplicates for department: ${name}`)
          // Keep the first one, delete the rest
          for (let i = 1; i < depts.length; i++) {
            await deleteDoc(doc(db, 'departments', depts[i].id))
            deletedCount++
            console.log(`Deleted duplicate department: ${depts[i].name} (ID: ${depts[i].id})`)
          }
        }
      }

      if (deletedCount > 0) {
        alert(`Cleaned up ${deletedCount} duplicate departments!`)
      } else {
        alert('No duplicate departments found.')
      }

    } catch (error) {
      console.error('Error cleaning up duplicate departments:', error)
      alert('Failed to clean up duplicates. Please try again.')
    }
  }

  // Cleans up broken email fields from users
  const cleanupUserEmails = async () => {
    if (!isAdmin()) {
      console.error('Unauthorised access attempt to cleanup user emails')
      return
    }

    try {
      // Get current user's organization
      let currentUserOrg = 'core-demo'
      const currentUserDoc = await getDoc(doc(db, 'users', user.uid))
      if (currentUserDoc.exists() && currentUserDoc.data().organization) {
        currentUserOrg = currentUserDoc.data().organization
      }

      // Get all users for this organization
      const usersSnapshot = await getDocs(query(collection(db, 'users'), where('organization', '==', currentUserOrg)))
      let cleanedCount = 0

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data()
        
        // Check if user has broken email (contains @.local) or is admin-created without name
        if (userData.email && (userData.email.includes('@.local') || userData.isAdminCreated)) {
          const updateData = {}
          
          // Remove broken email
          if (userData.email.includes('@.local')) {
            updateData.email = null
          }
          
          // Add name if missing and we can derive it from email
          if (!userData.name && userData.email && !userData.email.includes('@.local')) {
            // Extract name from valid email
            const emailPart = userData.email.split('@')[0]
            updateData.name = emailPart.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          } else if (!userData.name) {
            updateData.name = 'User ' + userDoc.id.slice(-4)
          }

          if (Object.keys(updateData).length > 0) {
            await updateDoc(doc(db, 'users', userDoc.id), updateData)
            cleanedCount++
            console.log(`Cleaned user: ${userDoc.id}`, updateData)
          }
        }
      }

      if (cleanedCount > 0) {
        alert(`Cleaned up ${cleanedCount} user records!`)
      } else {
        alert('No user cleanup needed.')
      }

    } catch (error) {
      console.error('Error cleaning up user emails:', error)
      alert('Failed to clean up user data. Please try again.')
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
        <div className="flex items-center space-x-4">
          {/* Back button */}
          <button
            onClick={() => navigate('/leaderboard')}
            className="group flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl hover:bg-[#f7c59f]/20 dark:hover:bg-gray-600/50 transition-all duration-300 text-[#4b3f2a] dark:text-white"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Leaderboard</span>
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-[#4b3f2a] dark:text-white mb-2">
              Administration Panel
            </h1>
            <p className="text-[#8b7355] dark:text-gray-300">
              Manage users, departments, and point categories
            </p>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                📋 Note: Administrative staff and HR/Management departments are automatically excluded from leaderboard participation
              </p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDeleteAccountModal(true)}
            className="bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-4 rounded-lg transition-colors border-2 border-red-600"
          >
            Delete Account
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Company Code Display */}
      {companyCode && (
        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50 shadow-xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#4b3f2a] dark:text-white mb-2">
                🔑 Employee Access Code
              </h3>
              <p className="text-[#8b7355] dark:text-gray-300 text-sm">
                Share this code with employees so they can view your company's leaderboard
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-mono bg-white/60 dark:bg-gray-700/60 px-4 py-2 rounded-lg border border-blue-300/50 dark:border-blue-600/50 text-[#4b3f2a] dark:text-white tracking-wider">
                {companyCode}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(companyCode)
                  alert('Company code copied to clipboard!')
                }}
                className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors"
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div>
              <h2 className="text-xl font-bold text-[#4b3f2a] dark:text-white">
                User Management
              </h2>
              <p className="text-sm text-[#8b7355] dark:text-gray-400 mt-1">
                🔄 Real-time sync active - changes appear automatically across all browsers
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const currentUserDoc = user?.uid ? getDoc(doc(db, 'users', user.uid)) : null
                  currentUserDoc?.then(doc => {
                    if (doc.exists()) {
                      console.log('Current user org:', doc.data().organization)
                      alert(`Current organization: ${doc.data().organization}\nUsers with different organizations won't see each other.`)
                    }
                  })
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                title="Check current organization"
              >
                🏢 Check Org
              </button>
              <button
                onClick={cleanupUserEmails}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                title="Clean up broken user data and emails"
              >
                🧹 Clean Users
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                title="Manual refresh (for testing - not needed with real-time sync)"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setShowAddUser(true)}
                className="bg-[#f7c59f] hover:bg-[#f4b183] text-[#4b3f2a] font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Add User
              </button>
            </div>
          </div>

          {/* Add user form */}
          {showAddUser && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-[#f7e7d7] dark:border-gray-700 space-y-4">
              <h3 className="text-lg font-semibold text-[#4b3f2a] dark:text-white">Add New User</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4b3f2a] dark:text-white mb-1">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-lg text-[#4b3f2a] dark:text-white dark:bg-gray-700"
                    placeholder="e.g. John Smith, Sarah Johnson"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#4b3f2a] dark:text-white mb-1">Role</label>
                  <input
                    type="text"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-lg text-[#4b3f2a] dark:text-white dark:bg-gray-700"
                    placeholder="e.g. Senior Developer, QA Engineer"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#4b3f2a] dark:text-white mb-1">Department</label>
                <div className="space-y-3">
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-lg text-[#4b3f2a] dark:text-white dark:bg-gray-700 appearance-none bg-white dark:bg-gray-700 cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3e%3cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3e%3c/path%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25rem 1.25rem' }}
                  >
                    <option value="" disabled>Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={quickDepartment}
                      onChange={(e) => setQuickDepartment(e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-lg text-[#4b3f2a] dark:text-white dark:bg-gray-700"
                      placeholder="Or create new department..."
                      onKeyPress={(e) => e.key === 'Enter' && addQuickDepartment()}
                    />
                    <button
                      type="button"
                      onClick={addQuickDepartment}
                      disabled={!quickDepartment.trim()}
                      className="px-3 py-2 bg-[#f7c59f] hover:bg-[#f4b183] disabled:bg-gray-300 disabled:cursor-not-allowed text-[#4b3f2a] font-medium rounded-lg transition-colors text-sm"
                    >
                      Add
                    </button>
                  </div>
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
                        value={newUser.points[key] === 0 ? '' : newUser.points[key]}
                        onChange={(e) => setNewUser({
                          ...newUser,
                          points: { ...newUser.points, [key]: parseInt(e.target.value) || 0 }
                        })}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-[#e9e4d7] dark:border-gray-600 rounded-lg text-[#4b3f2a] dark:text-white dark:bg-gray-700"
                        min="0"
                        placeholder="0"
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
                    <th className="px-6 py-3 text-left text-[#4b3f2a] dark:text-white font-semibold">Name</th>
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
                      <td className="px-6 py-4 text-[#4b3f2a] dark:text-white">
                        {user.name || (user.email && !user.email.includes('@.local') ? user.email : 'Unnamed User')}
                        {user.isAdminCreated && (
                          <span className="ml-2 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-medium rounded" title="Admin-created user (no authentication account)">
                            [A]
                          </span>
                        )}
                      </td>
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
                            value={user.points[key] === 0 ? '' : (user.points[key] || '')}
                            onChange={(e) => updateUserPoints(user.id, key, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className={`w-20 px-2 py-1 border border-[#e9e4d7] dark:border-gray-600 rounded text-[#4b3f2a] dark:text-white dark:bg-gray-700 ${category.color}`}
                            min="0"
                            placeholder="0"
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
            <div className="flex space-x-3">
              <button
                onClick={cleanupDuplicateDepartments}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                title="Remove duplicate departments"
              >
                🧹 Clean Duplicates
              </button>
              <button
                onClick={() => setShowAddDepartment(true)}
                className="bg-[#f7c59f] hover:bg-[#f4b183] text-[#4b3f2a] font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Add Department
              </button>
            </div>
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

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.954-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-[#4b3f2a] dark:text-white mb-2">
                Delete Admin Account
              </h3>
              
              <p className="text-[#8b7355] dark:text-gray-300 mb-6">
                This action cannot be undone. Deleting your admin account will permanently remove:
              </p>
              
              <div className="text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6">
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Your admin account and login credentials</li>
                  <li>• All associated user data</li>
                  <li>• Access to this admin panel</li>
                  <li>• Company invitation codes (employees keep access)</li>
                </ul>
              </div>
              
              <p className="text-sm text-[#8b7355] dark:text-gray-400 mb-6">
                <strong>Note:</strong> Existing employee accounts will remain unaffected.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteAccountModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteAccountModal(false)
                    handleDeleteAccount()
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage 