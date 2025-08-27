// Error Report Modal Component
// Allows users to report errors and issues via EmailJS
import React, { useState } from 'react'
import emailjs from '@emailjs/browser'
import { emailjsConfig } from '../config/emailjs'

const ErrorReportModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    userEmail: '',
    subject: '',
    message: '',
    errorType: 'bug',
    priority: 'medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // EmailJS configuration from centralized config
      const serviceId = emailjsConfig.serviceId
      const templateId = emailjsConfig.templates.errorReport
      const publicKey = emailjsConfig.publicKey

      const templateParams = {
        from_email: formData.userEmail,
                  to_email: emailjsConfig.adminEmail, // Your admin email
        subject: `[${formData.errorType.toUpperCase()}] ${formData.subject}`,
        message: formData.message,
        priority: formData.priority,
        error_type: formData.errorType,
        timestamp: new Date().toLocaleString(),
        user_agent: navigator.userAgent,
        page_url: window.location.href
      }

      // Send email via EmailJS
      await emailjs.send(serviceId, templateId, templateParams, publicKey)
      
      setSubmitStatus('success')
      setTimeout(() => {
        onClose()
        setFormData({
          userEmail: '',
          subject: '',
          message: '',
          errorType: 'bug',
          priority: 'medium'
        })
        setSubmitStatus(null)
      }, 2000)
    } catch (error) {
      console.error('Error sending email:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-[#f0e4d7]/30 dark:border-gray-700/30">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#4b3f2a] to-[#8b7355] bg-clip-text text-transparent dark:from-white dark:to-gray-300">
            Report an Issue
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div>
            <label htmlFor="userEmail" className="block text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2">
              Your Email
            </label>
            <input
              type="email"
              id="userEmail"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f7c59f] focus:border-transparent dark:text-white transition-all duration-300"
              placeholder="Enter your email address"
            />
          </div>

          {/* Error Type Selection */}
          <div>
            <label htmlFor="errorType" className="block text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2">
              Issue Type
            </label>
            <select
              id="errorType"
              name="errorType"
              value={formData.errorType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f7c59f] focus:border-transparent dark:text-white transition-all duration-300"
            >
              <option value="bug">🐛 Bug Report</option>
              <option value="feature">💡 Feature Request</option>
              <option value="ui">🎨 UI/UX Issue</option>
              <option value="performance">⚡ Performance Issue</option>
              <option value="other">❓ Other</option>
            </select>
          </div>

          {/* Priority Selection */}
          <div>
            <label htmlFor="priority" className="block text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2">
              Priority Level
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f7c59f] focus:border-transparent dark:text-white transition-all duration-300"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="critical">🔴 Critical</option>
            </select>
          </div>

          {/* Subject Input */}
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f7c59f] focus:border-transparent dark:text-white transition-all duration-300"
              placeholder="Brief description of the issue"
            />
          </div>

          {/* Message Textarea */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-[#4b3f2a] dark:text-white mb-2">
              Description
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-[#e9e4d7]/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f7c59f] focus:border-transparent dark:text-white transition-all duration-300 resize-none"
              placeholder="Please describe the issue in detail..."
            />
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm font-medium">
              ✅ Report sent successfully! We'll get back to you soon.
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              ❌ Failed to send report. Please try again or contact support directly.
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#f7c59f] to-[#f4b183] hover:from-[#f4b183] hover:to-[#e6a068] disabled:from-[#e9e4d7] disabled:to-[#e9e4d7] text-[#4b3f2a] font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:transform-none shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
              </div>
            ) : (
              'Send Report'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ErrorReportModal 