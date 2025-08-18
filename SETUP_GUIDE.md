# 🎯 CORE System Configuration Guide

## Overview
This guide will walk you through the complete setup of your CORE (Collaborative Organisational Excellence) system, including EmailJS and Firebase configurations.

## ✅ Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Firebase project** (already configured)
- **EmailJS account** (free tier available)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure EmailJS
Your EmailJS configuration is centralized in `src/config/emailjs.js`. You need to:

1. **Create EmailJS Account**
   - Go to [EmailJS.com](https://www.emailjs.com/)
   - Sign up for a free account
   - Create a new email service (Gmail, Outlook, Proton, etc.)

2. **Set up Email Templates**
   - Create two templates in your EmailJS dashboard:

   **Template 1: Invitation Code Email**
   - Template ID: `invitation_template`
   - Subject: `Your CORE Invitation Code`
   - Body:
   ```
   Hello {{admin_name}},

   Welcome to CORE! Your administrator account has been created.

   Your employee invitation code is: {{invitation_code}}

   {{instructions}}

   Best regards,
   The CORE Team
   ```

   **Template 2: Error Report Email**
   - Template ID: `error_report_template`
   - Subject: `{{subject}}`
   - Body:
   ```
   New issue reported via CORE:

   From: {{from_email}}
   Priority: {{priority}}
   Type: {{error_type}}
   Time: {{timestamp}}

   Subject: {{subject}}

   Description:
   {{message}}

   Technical Details:
   - Page URL: {{page_url}}
   - User Agent: {{user_agent}}
   ```

3. **Update Configuration**
   - Edit `src/config/emailjs.js`
   - Replace the following values:
     - ✅ Service ID already set: `service_17wda7b`
     - ✅ Public Key already set: `qfMpBhjKn2iZnKm7`
     - ✅ Admin email already set: `CORE-ticket@outlook.com`

### 3. Firebase Setup

✅ **Already Configured!** Your Firebase is set up with:
- Project ID: `core-iii-resub`
- Authentication ready
- Firestore ready

**Additional Firebase Setup Steps:**

1. **Enable Authentication**
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable "Email/Password" provider

2. **Create Firestore Database**
   - Go to Firebase Console → Firestore Database
   - Create database in production mode
   - Set up security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow authenticated users to read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Allow authenticated users to read leaderboard data
       match /leaderboard/{document=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

### 4. Start the Application
```bash
npm run dev
```

## 📧 EmailJS Configuration Details

### Getting Your EmailJS Credentials

1. **Service ID** 
   - EmailJS Dashboard → Email Services → [Your Service] → Service ID

2. **Public Key**
   - EmailJS Dashboard → Account → General → Public Key

3. **Template IDs**
   - EmailJS Dashboard → Email Templates → [Template Name] → Template ID

### Setting Up Proton Email with EmailJS

**For Proton Mail users, follow these specific steps:**

1. **Enable 2FA in Proton**
   - Go to Proton Settings → Security and Privacy → Two-factor authentication
   - Enable 2FA (required for app passwords)

2. **Create App Password**
   - Go to Account and password → App passwords
   - Create new app password named "EmailJS CORE System"
   - Select "Mail" scope
   - Copy the generated password

3. **Configure SMTP in EmailJS**
   ```
   Service Type: Custom SMTP
   SMTP Server: mail.protonmail.ch
   Port: 587 (STARTTLS) or 465 (SSL/TLS)
   Username: your-email@protonmail.com
   Password: [App Password from step 2]
   Security: STARTTLS (for port 587) or SSL/TLS (for port 465)
   ```

4. **Test Configuration**
   - EmailJS will send a test email to verify the connection
   - Check your Proton inbox for the test message

### Template Variables

**Invitation Template Variables:**
- `{{admin_name}}` - Admin's name (from email)
- `{{invitation_code}}` - Generated 8-character code
- `{{instructions}}` - Instructions for employees
- `{{to_email}}` - Admin's email address

**Error Report Template Variables:**
- `{{from_email}}` - User's email
- `{{subject}}` - Report subject
- `{{message}}` - Report description
- `{{priority}}` - Priority level (low, medium, high, critical)
- `{{error_type}}` - Type of error (bug, feature, ui, performance, other)
- `{{timestamp}}` - When the report was submitted
- `{{page_url}}` - URL where the error occurred
- `{{user_agent}}` - User's browser information

## 🔧 Configuration Files

### `src/config/emailjs.js`
```javascript
export const emailjsConfig = {
  serviceId: 'service_17wda7b',           // ✅ Already configured
  publicKey: 'qfMpBhjKn2iZnKm7',          // ✅ Already configured
  templates: {
    invitation: 'invitation_template',     // Invitation email template ID
    errorReport: 'error_report_template'   // Error report template ID
  },
  adminEmail: 'CORE-ticket@outlook.com'   // ✅ Already configured
}
```

### `src/config/firebase.js`
✅ **Already configured** with your Firebase project credentials.

## 🧪 Testing the System

### 1. Test Admin Registration
1. Navigate to `/register/admin`
2. Fill out the form with your admin email
3. Check your email for the invitation code
4. Verify the code is displayed on the success page

### 2. Test Employee Registration
1. Navigate to `/register/employee`
2. Use the invitation code from admin registration
3. Complete the employee registration form
4. Verify the account is created

### 3. Test Error Reporting
1. Click the help button (?) in the bottom-right corner
2. Fill out an error report
3. Submit the report
4. Check your admin email for the error report

### 4. Test Authentication
**Test Accounts (available without Firebase):**
- Admin: `admin@core.com` / `admin123`
- Employee: `employee@core.com` / `employee123`
- User: `john.doe@core.com` / `john123`

### 5. Test Email Configuration
1. Open browser developer console (F12)
2. Type `testCoreEmail()` and press Enter
3. Check console for success/error messages
4. Check your email inbox for test message

## 🛠️ Troubleshooting

### EmailJS Issues
- **Email not sending**: Check service ID, public key, and template IDs
- **Template not found**: Verify template IDs match exactly
- **Authentication failed**: Check your EmailJS public key

### Firebase Issues
- **Authentication failed**: Enable Email/Password provider in Firebase Console
- **Firestore errors**: Check security rules and database creation

### General Issues
- **Build errors**: Run `npm install` to ensure all dependencies are installed
- **Development server**: Try `npm run dev` to start the development server

## 📱 Features

### ✅ Completed Features
- **Admin Registration**: Create admin accounts with invitation codes
- **Employee Registration**: Register using invitation codes
- **Error Reporting**: Report bugs and issues via email
- **Authentication**: Login system with role-based access
- **Leaderboard**: Track employee performance
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile

### 🔧 System Architecture
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth (with mock fallback)
- **Database**: Firebase Firestore (with mock fallback)
- **Email**: EmailJS
- **State Management**: React Context

## 🎨 Design System

The application uses a consistent design system with:
- **Primary Colors**: Warm browns and golds (`#4b3f2a`, `#f7c59f`, `#f4b183`)
- **Glass Morphism**: Translucent backgrounds with backdrop blur
- **Responsive Typography**: Scales across device sizes
- **Hover Effects**: Smooth transitions and interactions
- **Dark Mode**: Full dark theme support

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Review the troubleshooting section
3. Use the error reporting feature in the app
4. Check browser console for error messages

## 🚀 Deployment Ready

Your CORE system is production-ready with:
- ✅ Real Firebase configuration
- ✅ EmailJS integration
- ✅ Responsive design
- ✅ Error handling
- ✅ Security best practices

Simply configure your EmailJS credentials and you're ready to go! 