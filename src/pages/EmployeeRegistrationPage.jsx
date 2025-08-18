// Employee Registration Page
// Handles employee account creation with invitation code validation
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'

const EmployeeRegistrationPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    invitationCode: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const navigate = useNavigate()
  const { register } = useAuth()

  const departments = [
    'Engineering',
    'Sales',
    'Marketing',
    'Human Resources',
    'Finance',
    'Operations',
    'Customer Support',
    'Design',
    'Product Management',
    'Quality Assurance'
  ]

  // Validate invitation code
  const validateInvitationCode = (code) => {
    const storedCode = localStorage.getItem('invitationCode')
    const codeExpiry = localStorage.getItem('invitationCodeExpiry')
    
    if (!storedCode || !codeExpiry) {
      return { valid: false, message: 'No invitation code found. Please contact your administrator.' }
    }
    
    if (Date.now() > parseInt(codeExpiry)) {
      return { valid: false, message: 'Invitation code has expired. Please request a new code from your administrator.' }
    }
    
    if (code.toUpperCase() !== storedCode.toUpperCase()) {
      return { valid: false, message: 'Invalid invitation code. Please check the code and try again.' }
    }
    
    return { valid: true, message: 'Invitation code is valid.' }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.department || !formData.invitationCode) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    // Validate invitation code
    const codeValidation = validateInvitationCode(formData.invitationCode)
    if (!codeValidation.valid) {
      setError(codeValidation.message)
      setLoading(false)
      return
    }

    try {
      // Register employee account
      await register(formData.email, formData.password, 'employee', formData.department)
      setSuccess(true)
      
      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
    } catch (error) {
      console.error('Registration failed:', error)
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-[#f0e4d7]/30 dark:border-gray-700/30">
            <div className="text-center">
              {/* Success icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#4b3f2a] dark:text-white mb-4">
                Welcome to CORE!
              </h2>
              
              <p className="text-[#8b7355] dark:text-gray-300 mb-6">
                Your employee account has been created successfully.
              </p>

              <div className="text-sm text-[#8b7355] dark:text-gray-400 mb-6">
                <p>✅ Account created in: <strong>{formData.department}</strong></p>
                <p>✅ Email: <strong>{formData.email}</strong></p>
                <p className="mt-2">You'll be redirected to login in a moment...</p>
              </div>

              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f7c59f]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-[#f0e4d7]/30 dark:border-gray-700/30">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#f7c59f] via-[#f4b183] to-[#e6a068] rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-[#4b3f2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4b3f2a] to-[#8b7355] bg-clip-text text-transparent dark:from-white dark:to-gray-300 mb-3">
              Employee Registration
            </h2>
            
            <p className="text-[#8b7355] dark:text-gray-300 font-medium">
              Join your team on CORE with your invitation code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f7c59f] focus:border-transparent dark:text-white transition-all duration-300"
                placeholder="your.email@company.com"
              />
            </div>

            {/* Department Selection */}
            <div>
              <label htmlFor="department" className="block text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f7c59f] focus:border-transparent dark:text-white transition-all duration-300"
              >
                <option value="">Select your department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Invitation Code Input */}
            <div>
              <label htmlFor="invitationCode" className="block text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2">
                Invitation Code
              </label>
              <input
                type="text"
                id="invitationCode"
                name="invitationCode"
                value={formData.invitationCode}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f7c59f] focus:border-transparent dark:text-white transition-all duration-300 font-mono text-center tracking-widest"
                placeholder="Enter 8-character code"
                maxLength="8"
                style={{ textTransform: 'uppercase' }}
              />
              <p className="text-xs text-[#8b7355] dark:text-gray-400 mt-1">
                Get this code from your administrator
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f7c59f] focus:border-transparent dark:text-white transition-all duration-300"
                placeholder="Create a secure password"
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f7c59f] focus:border-transparent dark:text-white transition-all duration-300"
                placeholder="Confirm your password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#f7c59f] to-[#f4b183] hover:from-[#f4b183] hover:to-[#e6a068] disabled:from-[#e9e4d7] disabled:to-[#e9e4d7] text-[#4b3f2a] font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Employee Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-[#8b7355] dark:text-gray-400 hover:text-[#4b3f2a] dark:hover:text-white transition-all duration-300 font-medium"
            >
              Already have an account? Sign in
            </button>
          </div>

          {/* Help text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-[#8b7355] dark:text-gray-500">
              Need help? Contact your administrator for an invitation code
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeRegistrationPage 