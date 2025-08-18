// Landing page for the application
// Provides professional hero section with login options
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'

// Renders the landing page with advanced CSS and centring
const LandingPage = () => {
  const { isFirebaseConfigured } = useAuth()

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-5xl mx-auto px-4">
        
        {/* Development notice when Firebase isn't configured */}
        {!isFirebaseConfigured && (
          <div className="mb-8 bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50 text-yellow-800 dark:text-yellow-200 px-6 py-4 rounded-2xl text-sm font-medium max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Development Mode</span>
            </div>
            <p>Firebase is not configured yet. Please update your Firebase credentials in <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded text-xs">src/config/firebase.js</code> to enable full functionality.</p>
          </div>
        )}

        {/* Hero section with floating elements */}
        <div className="relative">
          {/* Floating background elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-[#f7c59f]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#f4b183]/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#f7c59f]/10 to-[#f4b183]/10 rounded-full blur-3xl"></div>
          </div>

          {/* Main logo with enhanced styling */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-br from-[#f7c59f] via-[#f4b183] to-[#e6a068] rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-500">
                <span className="text-[#4b3f2a] font-bold text-5xl">C</span>
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#f7c59f] to-[#f4b183] rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Hero text with gradient styling */}
          <div className="space-y-6 mb-12">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-[#4b3f2a] via-[#8b7355] to-[#4b3f2a] bg-clip-text text-transparent leading-tight">
              CORE
            </h1>
            
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#8b7355] dark:text-gray-300">
                Collaborative Organisational Excellence
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#f7c59f] to-[#f4b183] mx-auto rounded-full"></div>
            </div>
            
            <p className="text-lg sm:text-xl text-[#8b7355] dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Transform your workplace with our comprehensive performance tracking system. 
              Foster healthy competition, celebrate achievements, and drive organisational success 
              through transparent departmental leaderboards.
            </p>
          </div>

          {/* Enhanced feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-[#f0e4d7]/30 dark:border-gray-700/30 hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold text-[#4b3f2a] dark:text-white mb-2">Performance Tracking</h3>
              <p className="text-[#8b7355] dark:text-gray-400 text-sm">Real-time leaderboards with comprehensive performance metrics</p>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-[#f0e4d7]/30 dark:border-gray-700/30 hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-[#4b3f2a] dark:text-white mb-2">Achievement System</h3>
              <p className="text-[#8b7355] dark:text-gray-400 text-sm">Automated badges and recognition for outstanding performance</p>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-[#f0e4d7]/30 dark:border-gray-700/30 hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-[#4b3f2a] dark:text-white mb-2">Department Analytics</h3>
              <p className="text-[#8b7355] dark:text-gray-400 text-sm">Detailed insights and reporting across all departments</p>
            </div>
          </div>
          
          {/* Enhanced action buttons with glass morphism */}
          <div className="space-y-8">
            {/* Get Started Section */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#4b3f2a] dark:text-white mb-2">Get Started</h3>
              <p className="text-[#8b7355] dark:text-gray-400">Choose your role to begin your CORE journey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Admin Registration Card */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 border border-[#f0e4d7]/30 dark:border-gray-700/30 hover:transform hover:scale-105 transition-all duration-300 shadow-xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#f7c59f] to-[#f4b183] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#4b3f2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-[#4b3f2a] dark:text-white mb-2">Administrator</h4>
                  <p className="text-[#8b7355] dark:text-gray-400 text-sm">Set up your organisation and manage employees</p>
                </div>
                
                <div className="space-y-3">
                  <Link 
                    to="/register/admin" 
                    className="group relative w-full bg-gradient-to-r from-[#f7c59f] to-[#f4b183] hover:from-[#f4b183] hover:to-[#e6a068] text-[#4b3f2a] font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center"
                  >
                    <span>Create Admin Account</span>
                  </Link>
                  
                  <Link 
                    to="/login?role=admin" 
                    className="w-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-lg hover:bg-white dark:hover:bg-gray-700 text-[#4b3f2a] dark:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-[#f0e4d7]/50 dark:border-gray-600/50 flex items-center justify-center"
                  >
                    <span>Admin Sign In</span>
                  </Link>
                </div>
              </div>

              {/* Employee Registration Card */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 border border-[#f0e4d7]/30 dark:border-gray-700/30 hover:transform hover:scale-105 transition-all duration-300 shadow-xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#f7c59f] to-[#f4b183] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#4b3f2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-[#4b3f2a] dark:text-white mb-2">Employee</h4>
                  <p className="text-[#8b7355] dark:text-gray-400 text-sm">Join your team with an invitation code</p>
                </div>
                
                <div className="space-y-3">
                  <Link 
                    to="/register/employee" 
                    className="group relative w-full bg-gradient-to-r from-[#f7c59f] to-[#f4b183] hover:from-[#f4b183] hover:to-[#e6a068] text-[#4b3f2a] font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center"
                  >
                    <span>Join with Code</span>
                  </Link>
                  
                  <Link 
                    to="/login?role=employee" 
                    className="w-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-lg hover:bg-white dark:hover:bg-gray-700 text-[#4b3f2a] dark:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-[#f0e4d7]/50 dark:border-gray-600/50 flex items-center justify-center"
                  >
                    <span>Employee Sign In</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-[#8b7355] dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Real-time Updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium">Cloud-based</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage 