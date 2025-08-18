// EmailJS Configuration
// Replace these values with your actual EmailJS credentials

export const emailjsConfig = {
  // Your EmailJS Service ID (from EmailJS dashboard)
  serviceId: 'service_17wda7b',
  
  // Your EmailJS Public Key (from EmailJS dashboard > Account > General)
  publicKey: 'qlMpBhjKn2iiZnKm7',
  
  // Template IDs for different email types
  templates: {
    invitation: 'invitation_template',
    errorReport: 'error_report_template'
  },
  
  // Admin email for receiving error reports
  adminEmail: 'CORE-ticket@outlook.com'
}

// Configuration validation
export const validateEmailjsConfig = () => {
  const missingFields = []
  
  if (!emailjsConfig.serviceId || emailjsConfig.serviceId.includes('YOUR_')) {
    missingFields.push('serviceId')
  }
  
  if (!emailjsConfig.publicKey || emailjsConfig.publicKey.includes('YOUR_')) {
    missingFields.push('publicKey')
  }
  
  if (!emailjsConfig.adminEmail || emailjsConfig.adminEmail.includes('YOUR_')) {
    missingFields.push('adminEmail')
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  }
} 