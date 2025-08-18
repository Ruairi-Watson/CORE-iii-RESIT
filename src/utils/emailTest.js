// EmailJS Test Utility
// Use this to test your Proton email configuration

import emailjs from '@emailjs/browser'
import { emailjsConfig, validateEmailjsConfig } from '../config/emailjs'

export const testEmailConfiguration = async () => {
  const validation = validateEmailjsConfig()
  
  if (!validation.isValid) {
    console.error('EmailJS not configured. Missing:', validation.missingFields)
    return {
      success: false,
      error: `Please configure: ${validation.missingFields.join(', ')}`
    }
  }

  try {
    const testParams = {
      to_email: emailjsConfig.adminEmail,
      from_email: emailjsConfig.adminEmail,
      subject: 'CORE EmailJS Test - Outlook',
      message: `This is a test email sent from your CORE system using Outlook.
      
      ✅ EmailJS configuration is working correctly!
      ✅ Outlook email service is connected
      ✅ Templates are properly configured
      
      Test details:
      - Service ID: ${emailjsConfig.serviceId}
      - Template: ${emailjsConfig.templates.errorReport}
      - Timestamp: ${new Date().toLocaleString()}
      
      Your CORE system is ready to send emails!`,
      priority: 'low',
      error_type: 'test',
      timestamp: new Date().toLocaleString(),
      page_url: window.location.href,
      user_agent: navigator.userAgent
    }

    await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.templates.errorReport,
      testParams,
      emailjsConfig.publicKey
    )

    return {
      success: true,
      message: 'Test email sent successfully! Check your Outlook inbox.'
    }
  } catch (error) {
    console.error('Email test failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to send test email'
    }
  }
}

// Console helper for testing
export const runEmailTest = () => {
  console.log('🧪 Testing EmailJS configuration with Outlook...')
  
  testEmailConfiguration().then(result => {
    if (result.success) {
      console.log('✅', result.message)
    } else {
      console.error('❌', result.error)
    }
  })
}

// Add to window for easy console access
if (typeof window !== 'undefined') {
  window.testCoreEmail = runEmailTest
} 