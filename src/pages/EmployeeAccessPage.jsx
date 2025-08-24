// Employee Access Page
// Handles employee access via company code (no registration required)
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase.js'

const EmployeeAccessPage = () => {
  const [companyCode, setCompanyCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { setEmployeeAccess } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!companyCode.trim()) {
      setError('Please enter a company access code')
      setLoading(false)
      return
    }

    try {
      // Validate company code in Firebase
      const codeQuery = query(
        collection(db, 'companyCodes'),
        where('code', '==', companyCode.toUpperCase()),
        where('isActive', '==', true)
      )
      
      const codeSnapshot = await getDocs(codeQuery)
      
      if (codeSnapshot.empty) {
        setError('Invalid or expired company code')
        setLoading(false)
        return
      }

      const codeDoc = codeSnapshot.docs[0]
      const codeData = codeDoc.data()
      
      // Check if code is expired
      const now = new Date()
      const expiresAt = codeData.expiresAt.toDate()
      
      if (now > expiresAt) {
        setError('This company code has expired')
        setLoading(false)
        return
      }

      // Set employee access in auth context
      await setEmployeeAccess(codeData.companyName, companyCode)
      
      // Navigate to leaderboard
      navigate('/leaderboard')
      
    } catch (error) {
      console.error('Code validation failed:', error)
      setError('Failed to validate code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#f7c59f]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#f4b183]/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Employee access form container */}
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-[#f0e4d7]/30 dark:border-gray-700/30">
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-700/20 rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#f7c59f] via-[#f4b183] to-[#e6a068] rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <span className="text-[#4b3f2a] font-bold text-3xl">🔑</span>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#f7c59f] to-[#f4b183] rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4b3f2a] to-[#8b7355] bg-clip-text text-transparent dark:from-white dark:to-gray-300 mb-3">
                Employee Access
              </h2>
              
              <p className="text-[#8b7355] dark:text-gray-300 font-medium">
                Enter your company access code to view the leaderboard
              </p>
              
              {/* Decorative line */}
              <div className="w-16 h-1 bg-gradient-to-r from-[#f7c59f] to-[#f4b183] mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Access form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Company code input */}
              <div className="relative">
                <label htmlFor="companyCode" className="block text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2 ml-1">
                  Company Access Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="companyCode"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                    required
                    maxLength="8"
                    className="w-full px-6 py-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f7c59f] focus:border-transparent dark:text-white transition-all duration-300 text-lg placeholder-[#8b7355]/60 dark:placeholder-gray-400 font-mono tracking-widest text-center"
                    placeholder="ABC12345"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#f7c59f]/5 to-[#f4b183]/5 pointer-events-none"></div>
                </div>
                <p className="text-xs text-[#8b7355] dark:text-gray-400 mt-2 ml-1">
                  Get this code from your company administrator
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="relative">
                  <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-[#f7c59f] to-[#f4b183] hover:from-[#f4b183] hover:to-[#e6a068] disabled:from-[#e9e4d7] disabled:to-[#e9e4d7] text-[#4b3f2a] font-bold py-4 px-6 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:transform-none shadow-xl hover:shadow-2xl text-lg"
              >
                <div className="flex items-center justify-center space-x-3">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Validating Code...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Access Leaderboard</span>
                    </>
                  )}
                </div>
                
                {/* Button glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#f7c59f] to-[#f4b183] rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </button>
            </form>

            {/* Admin link */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e9e4d7]/50 dark:border-gray-600/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white/80 dark:bg-gray-800/80 px-4 text-[#8b7355] dark:text-gray-400 font-medium">
                    Company Administrator?
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/register/admin')}
                className="group mt-4 inline-flex items-center space-x-2 bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 text-[#4b3f2a] dark:text-white hover:text-[#2d241a] dark:hover:text-gray-100 transition-all duration-300 font-semibold px-6 py-3 rounded-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Create Admin Account</span>
              </button>
            </div>

            {/* Back to home link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="group inline-flex items-center space-x-2 text-[#8b7355] dark:text-gray-400 hover:text-[#4b3f2a] dark:hover:text-white transition-all duration-300 font-medium"
              >
                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeAccessPage
