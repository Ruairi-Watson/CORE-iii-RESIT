// Leaderboard page component
// Displays employee rankings with advanced CSS styling and professional layout
// Shows user points, achievements, and departmental statistics with enhanced UX
import React, { useState, useEffect } from 'react'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where,
  updateDoc,
  doc 
} from 'firebase/firestore'
import { db } from '../config/firebase.js'

const LeaderboardPage = () => {
  // Authentication and state management
  const { logout, user, isAdmin } = useAuth()
  
  // State for leaderboard data
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [loading, setLoading] = useState(true)
  
  // State for achievements system
  const [achievements] = useState([
    { id: 'first_100', name: 'Century Club', description: 'Reach 100 points', points: 100, icon: '🏆' },
    { id: 'first_500', name: 'Elite Performer', description: 'Reach 500 points', points: 500, icon: '⭐' },
    { id: 'first_1000', name: 'Champion', description: 'Reach 1000 points', points: 1000, icon: '👑' },
    { id: 'department_leader', name: 'Department Leader', description: 'Top performer in department', points: 0, icon: '🥇' }
  ])

  // Loads data when component mounts
  useEffect(() => {
    loadData()
  }, [])

  // Filters users when department selection changes
  useEffect(() => {
    filterUsers()
  }, [users, selectedDepartment])

  // Loads users and departments from Firestore
  const loadData = async () => {
    try {
      setLoading(true)
      
      // Loads users ordered by points
      const usersQuery = query(collection(db, 'users'), orderBy('points', 'desc'))
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
      
      // Updates achievements for all users
      await updateAchievements(usersData)
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Updates achievements based on user performance
  const updateAchievements = async (usersData) => {
    for (const user of usersData) {
      const newAchievements = []
      
      // Points-based achievements
      achievements.forEach(achievement => {
        if (achievement.points > 0 && user.points >= achievement.points) {
          if (!user.achievements?.includes(achievement.id)) {
            newAchievements.push(achievement.id)
          }
        }
      })
      
      // Department leader achievement
      const departmentUsers = usersData.filter(u => u.department === user.department)
      const topInDepartment = departmentUsers.reduce((top, current) => 
        current.points > top.points ? current : top
      )
      
      if (topInDepartment.id === user.id && departmentUsers.length > 1) {
        if (!user.achievements?.includes('department_leader')) {
          newAchievements.push('department_leader')
        }
      }
      
      // Updates user achievements if new ones earned
      if (newAchievements.length > 0) {
        try {
          await updateDoc(doc(db, 'users', user.id), {
            achievements: [...(user.achievements || []), ...newAchievements]
          })
        } catch (error) {
          console.error('Error updating achievements:', error)
        }
      }
    }
  }

  // Filters users by selected department
  const filterUsers = () => {
    if (selectedDepartment === 'all') {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(users.filter(user => user.department === selectedDepartment))
    }
  }

  // Exports leaderboard data to CSV
  const exportToCSV = () => {
    const csvData = [
      ['Rank', 'Email', 'Department', 'Points', 'Achievements'],
      ...filteredUsers.map((user, index) => [
        index + 1,
        user.email,
        user.department || 'None',
        user.points || 0,
        (user.achievements || []).length
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `leaderboard_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
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
      {/* Enhanced header with gradient and glass effects */}
      <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 border border-[#f0e4d7]/30 dark:border-gray-700/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f7c59f]/5 to-[#f4b183]/10 rounded-3xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#4b3f2a] via-[#8b7355] to-[#4b3f2a] bg-clip-text text-transparent">
              Performance Leaderboard
            </h1>
            <p className="text-lg text-[#8b7355] dark:text-gray-300 max-w-2xl">
              Track your progress and see how you compare with colleagues across the organisation
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
          
          {/* Enhanced action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={exportToCSV}
              className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </button>
            
            {isAdmin() && (
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
          </div>
        </div>
      </div>

      {/* Enhanced department filter with glass morphism */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-[#f0e4d7]/30 dark:border-gray-700/30 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="flex-shrink-0">
            <label className="text-[#4b3f2a] dark:text-white font-semibold text-lg">
              Filter by Department:
            </label>
          </div>
          <div className="flex-grow">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full sm:w-auto min-w-[250px] px-4 py-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl dark:text-white font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#f7c59f] text-lg"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 text-[#8b7355] dark:text-gray-400 bg-[#f7c59f]/20 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium">
              {filteredUsers.length} employee{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced leaderboard with advanced styling */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-[#f0e4d7]/30 dark:border-gray-700/30 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#f7c59f]/20 to-[#f4b183]/20 p-6">
          <h2 className="text-2xl font-bold text-[#4b3f2a] dark:text-white flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#f7c59f] to-[#f4b183] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-[#4b3f2a]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span>Performance Rankings</span>
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#f7e7d7]/50 to-[#f0e4d7]/50 dark:from-gray-700/50 dark:to-gray-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-[#4b3f2a] dark:text-white font-bold text-lg">Rank</th>
                <th className="px-6 py-4 text-left text-[#4b3f2a] dark:text-white font-bold text-lg">Employee</th>
                <th className="px-6 py-4 text-left text-[#4b3f2a] dark:text-white font-bold text-lg">Department</th>
                <th className="px-6 py-4 text-left text-[#4b3f2a] dark:text-white font-bold text-lg">Points</th>
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
                    {/* Enhanced rank column */}
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
                    
                    {/* Enhanced employee column */}
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#f7c59f] to-[#f4b183] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-[#4b3f2a] font-bold text-lg">
                              {employee.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {isCurrentUser && (
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#f7c59f] to-[#f4b183] rounded-full blur animate-pulse"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[#4b3f2a] dark:text-white text-lg">
                            {employee.email.split('@')[0]}
                            {isCurrentUser && (
                              <span className="ml-3 text-xs bg-gradient-to-r from-[#f7c59f] to-[#f4b183] text-[#4b3f2a] px-3 py-1 rounded-full font-bold animate-pulse">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-[#8b7355] dark:text-gray-400">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Enhanced department column */}
                    <td className="px-6 py-6">
                      <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#e9e4d7] to-[#f0e4d7] dark:from-gray-600 dark:to-gray-700 text-[#4b3f2a] dark:text-white rounded-full text-sm font-semibold border border-[#f0e4d7]/50 dark:border-gray-600/50">
                        {employee.department || 'Unassigned'}
                      </span>
                    </td>
                    
                    {/* Enhanced points column */}
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-bold bg-gradient-to-r from-[#4b3f2a] to-[#8b7355] bg-clip-text text-transparent">
                          {employee.points || 0}
                        </span>
                        <span className="text-[#8b7355] dark:text-gray-400 font-medium">pts</span>
                      </div>
                    </td>
                    
                    {/* Enhanced achievements column */}
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
      </div>

      {/* Enhanced empty state */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-16 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-[#f0e4d7]/30 dark:border-gray-700/30">
          <div className="text-8xl mb-6 animate-bounce">📊</div>
          <h3 className="text-2xl font-bold text-[#4b3f2a] dark:text-white mb-3">
            No employees found
          </h3>
          <p className="text-[#8b7355] dark:text-gray-400 text-lg max-w-md mx-auto">
            {selectedDepartment === 'all' 
              ? 'No employees have been added to the system yet. Contact your administrator to get started.' 
              : `No employees found in the ${selectedDepartment} department. Try selecting a different department or check back later.`
            }
          </p>
        </div>
      )}

      {/* Enhanced achievement legend */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 border border-[#f0e4d7]/30 dark:border-gray-700/30 shadow-2xl">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-[#4b3f2a] to-[#8b7355] bg-clip-text text-transparent mb-3">
            Achievement System
          </h3>
          <p className="text-[#8b7355] dark:text-gray-400 text-lg">
            Unlock these badges by reaching milestones and excelling in your performance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <p className="text-[#8b7355] dark:text-gray-400 text-sm leading-relaxed">
                {achievement.description}
              </p>
              {achievement.points > 0 && (
                <div className="mt-3 inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#f7c59f] to-[#f4b183] text-[#4b3f2a] rounded-full text-xs font-bold">
                  {achievement.points} points
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage 