import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext.jsx'
import { LeaderboardProvider } from './features/leaderboard/LeaderboardContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import DarkModeToggle from './components/DarkModeToggle.jsx'

// Page components
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

// Header component with navigation
const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-[#f0e4d7]/30 dark:border-gray-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f7c59f] to-[#f4b183] rounded-xl flex items-center justify-center">
              <span className="text-[#4b3f2a] font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#4b3f2a] to-[#8b7355] bg-clip-text text-transparent dark:from-white dark:to-gray-300">
              CORE
            </span>
          </div>

          {/* Dark mode toggle */}
          <DarkModeToggle />
        </div>
      </div>
    </header>
  )
}

// Footer component
const Footer = () => {
  return (
    <footer className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-t border-[#f0e4d7]/30 dark:border-gray-700/30 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-[#f7c59f] to-[#f4b183] rounded-lg flex items-center justify-center">
              <span className="text-[#4b3f2a] font-bold">C</span>
            </div>
            <span className="text-lg font-bold text-[#4b3f2a] dark:text-white">
              CORE
            </span>
          </div>
          <p className="text-sm text-[#8b7355] dark:text-gray-400 mb-4">
            Collaborative Organisational Excellence
          </p>
          <div className="flex justify-center space-x-6 text-xs text-[#8b7355] dark:text-gray-500">
            <span>© 2024 CORE</span>
            <span>•</span>
            <span>Performance Management</span>
            <span>•</span>
            <span>Professional Development</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Layout wrapper component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf6ee] to-[#f9ede1] dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <Footer />
    </div>
  )
}

// Main App component
function App() {
  // Initialize dark mode
  useEffect(() => {
    // Check for saved theme or default to light mode
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <AuthProvider>
      <LeaderboardProvider>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={
              <Layout>
                <LandingPage />
              </Layout>
            } 
          />
          <Route 
            path="/login" 
            element={
              <Layout>
                <LoginPage />
              </Layout>
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LeaderboardPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Layout>
                  <AdminPage />
                </Layout>
              </AdminRoute>
            } 
          />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LeaderboardProvider>
    </AuthProvider>
  )
}

export default App 