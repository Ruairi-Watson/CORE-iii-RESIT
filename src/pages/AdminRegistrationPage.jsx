// Admin Registration Page
// Handles admin account creation and sends invitation code via EmailJS
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext.jsx'
import emailjs from '@emailjs/browser'
import { emailjsConfig } from '../config/emailjs'

const AdminRegistrationPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Management'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [invitationCode, setInvitationCode] = useState('')
  
  const navigate = useNavigate()
  const { register } = useAuth()

  // Generate a unique invitation code
  const generateInvitationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  // Send invitation code via EmailJS
  const sendInvitationCode = async (email, code) => {
    try {
      // EmailJS configuration from centralized config
      const serviceId = emailjsConfig.serviceId
      const templateId = emailjsConfig.templates.invitation
      const publicKey = emailjsConfig.publicKey

      const templateParams = {
        to_email: email,
        admin_email: email,
        invitation_code: code,
        company_name: 'CORE',
        admin_name: email.split('@')[0],
        instructions: `Share this code with your employees so they can create their CORE accounts. This code expires in 30 days.`
      }

      await emailjs.send(serviceId, templateId, templateParams, publicKey)
      return true
    } catch (error) {
      console.error('Error sending invitation code:', error)
      return false
    }
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
    if (!formData.email || !formData.password || !formData.confirmPassword) {
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

    try {
      // Generate invitation code
      const code = generateInvitationCode()
      
      // Store invitation code in localStorage for mock authentication
      // In a real app, this would be stored in a database
      localStorage.setItem('invitationCode', code)
      localStorage.setItem('invitationCodeExpiry', (Date.now() + 30 * 24 * 60 * 60 * 1000).toString()) // 30 days
      localStorage.setItem('adminEmail', formData.email)

      // Register admin account
      await register(formData.email, formData.password, 'admin', formData.department)
      
      // Send invitation code via email
      const emailSent = await sendInvitationCode(formData.email, code)
      
      if (emailSent) {
        setInvitationCode(code)
        setSuccess(true)
      } else {
        // Still show code even if email failed, for testing
        setInvitationCode(code)
        setSuccess(true)
        setError('Account created but email failed to send. Your invitation code is displayed below.')
      }
      
    } catch (error) {
      console.error('Registration failed:', error)
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    navigate('/login')
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
                Admin Account Created!
              </h2>
              
              <p className="text-[#8b7355] dark:text-gray-300 mb-6">
                Your invitation code has been sent to your email. Share this code with your employees:
              </p>

              {/* Invitation Code Display */}
              <div className="bg-gradient-to-r from-[#f7c59f]/20 to-[#f4b183]/20 backdrop-blur-sm border border-[#f7c59f]/30 rounded-xl p-6 mb-6">
                <div className="text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2">
                  Employee Invitation Code
                </div>
                <div className="text-3xl font-bold text-[#4b3f2a] dark:text-white tracking-widest font-mono bg-white/50 dark:bg-gray-700/50 rounded-lg p-4">
                  {invitationCode}
                </div>
                <div className="text-xs text-[#8b7355] dark:text-gray-400 mt-2">
                  Code expires in 30 days
                </div>
              </div>

              {/* Instructions */}
              <div className="text-sm text-[#8b7355] dark:text-gray-400 mb-6 text-left">
                <p className="mb-2"><strong>Instructions for employees:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Go to the employee registration page</li>
                  <li>Enter their email and desired password</li>
                  <li>Use the invitation code above</li>
                  <li>Complete their profile setup</li>
                </ul>
              </div>

              {error && (
                <div className="bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50 text-yellow-600 dark:text-yellow-400 px-4 py-3 rounded-xl text-sm font-medium mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-[#f7c59f] to-[#f4b183] hover:from-[#f4b183] hover:to-[#e6a068] text-[#4b3f2a] font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                Continue to Login
              </button>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4b3f2a] to-[#8b7355] bg-clip-text text-transparent dark:from-white dark:to-gray-300 mb-3">
              Admin Registration
            </h2>
            
            <p className="text-[#8b7355] dark:text-gray-300 font-medium">
              Set up your CORE administrator account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2">
                Admin Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f7c59f] focus:border-transparent dark:text-white transition-all duration-300"
                placeholder="admin@company.com"
              />
            </div>

            {/* Department Input */}
            <div>
              <label htmlFor="department" className="block text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f7c59f] focus:border-transparent dark:text-white transition-all duration-300"
              >
                <option value="Management">Management</option>
                <option value="HR">Human Resources</option>
                <option value="Operations">Operations</option>
                <option value="IT">Information Technology</option>
              </select>
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
                placeholder="Enter secure password"
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
                'Create Admin Account'
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
        </div>
      </div>
    </div>
  )
}

export default AdminRegistrationPage 