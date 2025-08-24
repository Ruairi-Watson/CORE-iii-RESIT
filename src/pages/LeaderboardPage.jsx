// Enhanced leaderboard page component for employee performance visualisation
// Displays eligible employee rankings across four performance categories with filtering capabilities
// Features attendance, collaboration, efficiency, and innovation metrics with advanced charting
// Excludes HR and Management departments from rankings to maintain competitive fairness
import React, { useState, useEffect } from 'react'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { filterLeaderboardEligibleUsers, validateUserLeaderboardEligibility } from '../utils/filter.js'
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
  onSnapshot 
} from 'firebase/firestore'
import { db } from '../firebase.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const LeaderboardPage = () => {
  // Authentication and state management
  const { logout, user, isAdmin, isFirebaseConfigured, employeeAccess } = useAuth()
  
  // State for leaderboard data
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState('all-time')
  const [selectedCategory, setSelectedCategory] = useState('total')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'chart'
  const [loading, setLoading] = useState(true)
  
  // Check if current user is admin
  const isCurrentUserAdmin = isAdmin()
  
  // Point categories configuration
  const pointCategories = {
    total: { name: 'Total Points', color: '#f59e0b', icon: '🏆' },
    attendance: { name: 'Attendance', color: '#10b981', icon: '📅' },
    collaboration: { name: 'Collaboration', color: '#3b82f6', icon: '🤝' },
    efficiency: { name: 'Efficiency', color: '#f97316', icon: '⚡' },
    innovation: { name: 'Innovation', color: '#a855f7', icon: '💡' }
  }
  
  // State for achievements system
  const [achievements] = useState([
    { id: 'attendance_master', name: 'Attendance Master', description: 'Reach 100 attendance points', category: 'attendance', points: 100, icon: '📅' },
    { id: 'collaboration_champion', name: 'Collaboration Champion', description: 'Reach 100 collaboration points', category: 'collaboration', points: 100, icon: '🤝' },
    { id: 'efficiency_expert', name: 'Efficiency Expert', description: 'Reach 100 efficiency points', category: 'efficiency', points: 100, icon: '⚡' },
    { id: 'innovation_leader', name: 'Innovation Leader', description: 'Reach 100 innovation points', category: 'innovation', points: 100, icon: '💡' },
    { id: 'all_rounder', name: 'All-Rounder', description: 'Reach 50 points in all categories', category: 'total', points: 0, icon: '🌟' },
    { id: 'total_champion', name: 'Total Champion', description: 'Reach 500 total points', category: 'total', points: 500, icon: '👑' }
  ])

  // Sets up real-time listeners when component mounts
  useEffect(() => {
    setupRealtimeListeners()
    
    // Cleanup listeners on unmount
    return () => {
      if (window.leaderboardUnsubscribers) {
        window.leaderboardUnsubscribers.unsubscribeUsers?.()
        window.leaderboardUnsubscribers.unsubscribeDepartments?.()
        delete window.leaderboardUnsubscribers
        console.log('Leaderboard real-time listeners cleaned up')
      }
    }
  }, [])

  // Filters users when selections change
  useEffect(() => {
    filterUsers()
  }, [users, selectedDepartment, selectedTimeframe, selectedCategory])

  // Sets up real-time listeners for users and departments with proper access control
  const setupRealtimeListeners = async () => {
    try {
      setLoading(true)
      
      let usersData = []
      
      // Both admins and employees can see all users from their organization
      // This ensures a competitive leaderboard while maintaining data security
      let currentUserOrg = null
      
      if (employeeAccess) {
        // Employee access via company code
        currentUserOrg = employeeAccess.companyName
        console.log(`Loading users for company (employee access): ${currentUserOrg}`)
      } else if (user?.uid) {
        // Admin access via Firebase auth
        const currentUserDoc = await getDoc(doc(db, 'users', user.uid))
        if (currentUserDoc.exists()) {
          currentUserOrg = currentUserDoc.data().organization
          console.log(`Loading users for organization (admin): ${currentUserOrg}`)
        }
      }
      
      if (currentUserOrg) {
        
        const usersQuery = query(collection(db, 'users'), where('organization', '==', currentUserOrg))
        
        // Set up real-time listener for users
        const unsubscribeUsers = onSnapshot(usersQuery, async (snapshot) => {
          console.log('Real-time leaderboard users update received')
          let usersData = snapshot.docs.map(doc => {
          const data = doc.data()
          // Handle both old and new point structures
          if (typeof data.points === 'number') {
            // Convert old structure to new structure
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
          
          console.log(`Loaded ${usersData.length} users from organization: ${currentUserOrg}`)
          
          // Add mock users if they exist (for development environment)
          if (process.env.NODE_ENV === 'development') {
            try {
              const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '{}')
              const mockUserArray = Object.values(mockUsers).map(mockUser => ({
                id: mockUser.uid,
                email: mockUser.email,
                name: mockUser.name || (mockUser.email ? mockUser.email.split('@')[0] : 'User'),
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
                isMockUser: true
              }))
              
              // Both admins and employees can see all mock users from their organization
              const orgMockUsers = mockUserArray.filter(mockUser => mockUser.organization === currentUserOrg)
              usersData = [...usersData, ...orgMockUsers]
              console.log(`Added ${orgMockUsers.length} mock users to ${isCurrentUserAdmin ? 'admin' : 'employee'} view`)
            } catch (error) {
              console.log('No mock users found or error loading them:', error)
            }
          }
          
          // Calculate total points if not already set
          usersData = usersData.map(user => ({
            ...user,
            points: {
              ...user.points,
              total: user.points.attendance + user.points.collaboration + user.points.efficiency + user.points.innovation
            }
          }))
          
          // Filter out HR and Management departments from leaderboard display
          const eligibleUsers = filterLeaderboardEligibleUsers(usersData)
          console.log('Eligible users after filtering:', eligibleUsers.length)
          
          setUsers(eligibleUsers)
          setLoading(false)
          
          // Updates achievements for all users (admin only)
          if (isCurrentUserAdmin) {
            console.log('Current user is admin, updating achievements...')
            await updateAchievements(usersData)
          }
        }, (error) => {
          console.error('Error with leaderboard users real-time listener:', error)
          setLoading(false)
        })
        
        // Store unsubscribe function
        window.leaderboardUnsubscribers = { unsubscribeUsers }
        
      } else {
        console.log('Current user document not found, falling back to default organization')
        // Fallback for users without proper organization setup - set up listener for default org
        const usersQuery = query(collection(db, 'users'), where('organization', '==', 'core-demo'))
        const unsubscribeUsers = onSnapshot(usersQuery, async (snapshot) => {
          console.log('Real-time leaderboard users update received (fallback org)')
          let usersData = snapshot.docs.map(doc => {
            const data = doc.data()
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
          
          // Filter out HR and Management departments from leaderboard display
          const eligibleUsers = filterLeaderboardEligibleUsers(usersData)
          setUsers(eligibleUsers)
          setLoading(false)
          
          // Updates achievements for all users (admin only)
          if (isCurrentUserAdmin) {
            await updateAchievements(usersData)
          }
        }, (error) => {
          console.error('Error with fallback leaderboard users real-time listener:', error)
          setLoading(false)
        })
        
        // Store unsubscribe function
        window.leaderboardUnsubscribers = { unsubscribeUsers }
      }
      
      // Set up departments listener
      const deptQuery = query(collection(db, 'departments'))
      const unsubscribeDepartments = onSnapshot(deptQuery, (snapshot) => {
        console.log('Real-time departments update received')
        const deptData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setDepartments(deptData)
      }, (error) => {
        console.error('Error with departments real-time listener:', error)
      })
      
      // Update unsubscribers with departments listener
      if (window.leaderboardUnsubscribers) {
        window.leaderboardUnsubscribers.unsubscribeDepartments = unsubscribeDepartments
      } else {
        window.leaderboardUnsubscribers = { unsubscribeDepartments }
      }
      
      // Set loading to false if no Firebase configuration
      if (!isFirebaseConfigured) {
        setLoading(false)
      }
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Updates achievements based on user performance (ADMIN ONLY)
  const updateAchievements = async (usersData) => {
    console.log('Updating achievements for', usersData.length, 'users')
    for (const user of usersData) {
      console.log(`Checking achievements for ${user.name || user.email || user.id}:`, {
        id: user.id,
        points: user.points,
        currentAchievements: user.achievements || []
      })
      const newAchievements = []
      
      // Category-specific achievements
      achievements.forEach(achievement => {
        if (achievement.category !== 'total' && achievement.points > 0) {
          const categoryPoints = user.points[achievement.category] || 0
          if (categoryPoints >= achievement.points) {
            if (!user.achievements?.includes(achievement.id)) {
              console.log(`User ${user.name || user.email || user.id} earned achievement: ${achievement.name}`)
              newAchievements.push(achievement.id)
            }
          }
        }
      })
      
      // All-rounder achievement
      const allCategoriesAbove50 = ['attendance', 'collaboration', 'efficiency', 'innovation']
        .every(category => (user.points[category] || 0) >= 50)
      if (allCategoriesAbove50 && !user.achievements?.includes('all_rounder')) {
        console.log(`User ${user.name || user.email || user.id} earned All-Rounder achievement`)
        newAchievements.push('all_rounder')
      }
      
      // Total champion achievement
      if (user.points.total >= 500 && !user.achievements?.includes('total_champion')) {
        console.log(`User ${user.name || user.email || user.id} earned Total Champion achievement (${user.points.total} points)`)
        newAchievements.push('total_champion')
      }
      
      // Updates user achievements if new ones earned
      if (newAchievements.length > 0) {
        console.log(`Updating ${user.name || user.email || user.id} with new achievements:`, newAchievements)
        try {
          if (!user.id) {
            console.error(`No user.id found for ${user.name || user.email || 'unknown user'}, cannot update achievements`)
            continue
          }
          await updateDoc(doc(db, 'users', user.id), {
            achievements: [...(user.achievements || []), ...newAchievements]
          })
          console.log(`Successfully updated ${user.name || user.email || user.id} achievements`)
        } catch (error) {
          console.error(`Error updating achievements for ${user.name || user.email || user.id}:`, error)
        }
      } else {
        console.log(`No new achievements for ${user.name || user.email || user.id}`)
      }
    }
  }

  // Filters users by department and timeframe
  const filterUsers = () => {
    let filtered = [...users]
    
    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(user => user.department === selectedDepartment)
    }
    
    // Sort by the selected category
    filtered.sort((a, b) => {
      const aPoints = selectedCategory === 'total' ? a.points.total : a.points[selectedCategory] || 0
      const bPoints = selectedCategory === 'total' ? b.points.total : b.points[selectedCategory] || 0
      return bPoints - aPoints
    })
    
    setFilteredUsers(filtered)
  }



  // Gets rank suffix (1st, 2nd, 3rd, etc.)
  const getRankSuffix = (rank) => {
    if (rank % 100 >= 11 && rank % 100 <= 13) return 'th'
    switch (rank % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  // Prepares chart data
  const getChartData = () => {
    const allUsers = filteredUsers
    const category = pointCategories[selectedCategory]
    
    return {
      labels: allUsers.map(user => user.name || (user.email ? user.email.split('@')[0] : 'User')),
      datasets: [
        {
          label: category.name,
          data: allUsers.map(user => 
            selectedCategory === 'total' ? user.points.total : user.points[selectedCategory] || 0
          ),
          backgroundColor: category.color + 'CC', // More opaque for better visibility
          borderColor: category.color,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: category.color + 'FF', // Full opacity on hover
          hoverBorderColor: category.color,
          hoverBorderWidth: 3,
        },
      ],
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#4b3f2a',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: `${pointCategories[selectedCategory].name} Rankings`,
        color: '#4b3f2a',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(75, 63, 42, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: pointCategories[selectedCategory].color,
        borderWidth: 2,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} points`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#4b3f2a',
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 63, 42, 0.1)',
          borderDash: [5, 5]
        },
        ticks: {
          color: '#4b3f2a',
          font: {
            size: 12
          }
        }
      },
    },
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-[#f7c59f] to-[#f4b183] rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-[#4b3f2a] font-bold text-xl">C</span>
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-[#f7c59f] to-[#f4b183] rounded-2xl blur opacity-30 animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced header */}
      <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 border border-[#f0e4d7]/30 dark:border-gray-700/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f7c59f]/5 to-[#f4b183]/10 rounded-3xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#4b3f2a] via-[#8b7355] to-[#4b3f2a] bg-clip-text text-transparent">
              Performance Leaderboard
            </h1>
            <p className="text-lg text-[#8b7355] dark:text-gray-300 max-w-2xl">
              {isCurrentUserAdmin 
                ? "Manage and track performance across 4 key areas: Attendance, Collaboration, Efficiency, and Innovation" 
                : "View your performance and compare with colleagues across 4 key areas: Attendance, Collaboration, Efficiency, and Innovation"
              }
            </p>
            <p className="text-sm text-[#8b7355] dark:text-gray-400 mt-2">
              🔄 Real-time sync active - data updates automatically across all browsers
            </p>
            <div className="flex items-center space-x-4 text-sm text-[#8b7355] dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <span>{filteredUsers.length} Employees</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Admin Panel access for admins only */}
            {isCurrentUserAdmin && (
              <button
                onClick={() => window.location.href = '/admin'}
                className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Admin Panel</span>
              </button>
            )}
            
            <button
              onClick={logout}
              className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced filters and controls */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-[#f0e4d7]/30 dark:border-gray-700/30 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Department filter */}
          <div>
            <label className="block text-[#4b3f2a] dark:text-white font-semibold mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-lg dark:text-white font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#f7c59f]"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe filter */}
          <div>
            <label className="block text-[#4b3f2a] dark:text-white font-semibold mb-2">
              Timeframe
            </label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-lg dark:text-white font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#f7c59f]"
            >
              <option value="all-time">All Time</option>
              <option value="monthly">This Month</option>
              <option value="weekly">This Week</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-[#4b3f2a] dark:text-white font-semibold mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-lg dark:text-white font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#f7c59f]"
            >
              {Object.entries(pointCategories).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* View mode toggle */}
          <div>
            <label className="block text-[#4b3f2a] dark:text-white font-semibold mb-2">
              View Mode
            </label>
            <div className="flex rounded-lg bg-white/80 dark:bg-gray-700/80 border border-[#e9e4d7]/50 dark:border-gray-600/50 overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 px-4 py-2 font-medium transition-all duration-300 ${
                  viewMode === 'table'
                    ? 'bg-[#f7c59f] text-[#4b3f2a] font-bold'
                    : 'text-[#8b7355] dark:text-gray-300 hover:bg-[#f7c59f]/20'
                }`}
              >
                📊 Table
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`flex-1 px-4 py-2 font-medium transition-all duration-300 ${
                  viewMode === 'chart'
                    ? 'bg-[#f7c59f] text-[#4b3f2a] font-bold'
                    : 'text-[#8b7355] dark:text-gray-300 hover:bg-[#f7c59f]/20'
                }`}
              >
                📈 Chart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard content */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-[#f0e4d7]/30 dark:border-gray-700/30 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#f7c59f]/20 to-[#f4b183]/20 p-6">
          <h2 className="text-2xl font-bold text-[#4b3f2a] dark:text-white flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#f7c59f] to-[#f4b183] rounded-lg flex items-center justify-center">
              <span className="text-xl">{pointCategories[selectedCategory].icon}</span>
            </div>
            <span>{pointCategories[selectedCategory].name} Rankings</span>
          </h2>
        </div>
        
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#f7e7d7]/50 to-[#f0e4d7]/50 dark:from-gray-700/50 dark:to-gray-600/50">
                <tr>
                  <th className="px-6 py-4 text-left text-[#4b3f2a] dark:text-white font-bold text-lg">Rank</th>
                  <th className="px-6 py-4 text-left text-[#4b3f2a] dark:text-white font-bold text-lg">Employee</th>
                  <th className="px-6 py-4 text-left text-[#4b3f2a] dark:text-white font-bold text-lg">Department</th>
                  <th className="px-6 py-4 text-left text-[#4b3f2a] dark:text-white font-bold text-lg">📅 Attendance</th>
                  <th className="px-6 py-4 text-left text-[#4b3f2a] dark:text-white font-bold text-lg">🤝 Collaboration</th>
                  <th className="px-6 py-4 text-left text-[#4b3f2a] dark:text-white font-bold text-lg">⚡ Efficiency</th>
                  <th className="px-6 py-4 text-left text-[#4b3f2a] dark:text-white font-bold text-lg">💡 Innovation</th>
                  <th className="px-6 py-4 text-left text-[#4b3f2a] dark:text-white font-bold text-lg">🏆 Total</th>
                  <th className="px-6 py-4 text-left text-[#4b3f2a] dark:text-white font-bold text-lg">Achievements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e4d7]/30 dark:divide-gray-700/30">
                {filteredUsers.map((employee, index) => {
                  const rank = index + 1
                  const isCurrentUser = employee.id === user?.uid
                  
                  return (
                    <tr 
                      key={employee.id} 
                      className={`group hover:bg-gradient-to-r hover:from-[#f7c59f]/10 hover:to-[#f4b183]/10 dark:hover:from-white/5 dark:hover:to-white/5 transition-all duration-300 ${
                        isCurrentUser ? 'bg-gradient-to-r from-[#f7c59f]/20 to-[#f4b183]/20 dark:from-yellow-900/30 dark:to-yellow-800/30' : ''
                      }`}
                    >
                      {/* Rank column */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          {rank <= 3 && (
                            <div className="relative">
                              <span className="text-3xl animate-pulse">
                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                              </span>
                              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur opacity-20"></div>
                            </div>
                          )}
                          <div className={`text-2xl font-bold ${
                            rank <= 3 
                              ? 'bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent' 
                              : 'text-[#4b3f2a] dark:text-white'
                          }`}>
                            {rank}{getRankSuffix(rank)}
                          </div>
                        </div>
                      </td>
                      
                      {/* Employee column */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#f7c59f] to-[#f4b183] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <span className="text-[#4b3f2a] font-bold text-lg">
                                {(employee.name || employee.email || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {isCurrentUser && (
                              <div className="absolute -inset-1 bg-gradient-to-r from-[#f7c59f] to-[#f4b183] rounded-full blur animate-pulse"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-[#4b3f2a] dark:text-white text-lg">
                              {employee.name || (employee.email ? employee.email.split('@')[0] : 'User')}
                              {isCurrentUser && (
                                <span className="ml-3 text-xs bg-gradient-to-r from-[#f7c59f] to-[#f4b183] text-[#4b3f2a] px-3 py-1 rounded-full font-bold animate-pulse">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-[#8b7355] dark:text-gray-400">
                              {employee.department || 'No Department'}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Department column */}
                      <td className="px-6 py-6">
                        <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#e9e4d7] to-[#f0e4d7] dark:from-gray-600 dark:to-gray-700 text-[#4b3f2a] dark:text-white rounded-full text-sm font-semibold border border-[#f0e4d7]/50 dark:border-gray-600/50">
                          {employee.department || 'Unassigned'}
                        </span>
                      </td>
                      
                      {/* Points columns */}
                      <td className="px-6 py-6">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                          {employee.points.attendance || 0}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {employee.points.collaboration || 0}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                          {employee.points.efficiency || 0}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {employee.points.innovation || 0}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-2xl font-bold bg-gradient-to-r from-[#4b3f2a] to-[#8b7355] bg-clip-text text-transparent">
                          {employee.points.total || 0}
                        </div>
                      </td>
                      
                      {/* Achievements column */}
                      <td className="px-6 py-6">
                        <div className="flex gap-2 flex-wrap">
                          {employee.achievements?.map(achievementId => {
                            const achievement = achievements.find(a => a.id === achievementId)
                            return achievement ? (
                              <div
                                key={achievementId}
                                title={`${achievement.name}: ${achievement.description}`}
                                className="relative group/achievement"
                              >
                                <span className="text-2xl cursor-help transform hover:scale-125 transition-transform duration-200 inline-block">
                                  {achievement.icon}
                                </span>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/achievement:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                  {achievement.name}
                                </div>
                              </div>
                            ) : null
                          })}
                          {(!employee.achievements || employee.achievements.length === 0) && (
                            <span className="text-[#8b7355] dark:text-gray-400 text-sm italic">
                              No achievements yet
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <div className="h-96">
              <Bar data={getChartData()} options={chartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Enhanced achievement legend */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 border border-[#f0e4d7]/30 dark:border-gray-700/30 shadow-2xl">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-[#4b3f2a] to-[#8b7355] bg-clip-text text-transparent mb-3">
            Achievement System
          </h3>
          <p className="text-[#8b7355] dark:text-gray-400 text-lg">
            Unlock these badges by excelling in specific performance areas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className="group bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-[#f0e4d7]/50 dark:border-gray-600/50 text-center hover:transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="text-5xl mb-4 group-hover:animate-bounce">
                {achievement.icon}
              </div>
              <h4 className="font-bold text-[#4b3f2a] dark:text-white text-lg mb-2">
                {achievement.name}
              </h4>
              <p className="text-[#8b7355] dark:text-gray-400 text-sm leading-relaxed mb-3">
                {achievement.description}
              </p>
              <div className="flex justify-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  achievement.category === 'attendance' ? 'bg-green-100 text-green-800' :
                  achievement.category === 'collaboration' ? 'bg-blue-100 text-blue-800' :
                  achievement.category === 'efficiency' ? 'bg-amber-100 text-amber-800' :
                  achievement.category === 'innovation' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {achievement.category}
                </span>
                {achievement.points > 0 && (
                  <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#f7c59f] to-[#f4b183] text-[#4b3f2a] rounded-full text-xs font-bold">
                    {achievement.points} points
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage 