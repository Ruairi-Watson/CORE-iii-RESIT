// Global Jest setup configuration for React Testing Library environment
// Extends Jest with custom matchers and essential mocking for external dependencies
import '@testing-library/jest-dom'

// Firebase module mocking with virtual implementation
// Prevents actual Firebase initialisation during test execution
jest.mock('./firebase.js', () => ({
  // Authentication service mock with minimal interface
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn()
  },
  // Firestore database mock
  db: {},
  // Cloud storage mock
  storage: {}
}), { virtual: true })

// TypeScript Firebase module variant mock
jest.mock('./firebase.ts', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn()
  },
  db: {},
  storage: {}
}), { virtual: true })

// Firebase configuration module mock
// Ensures configuration dependencies resolve correctly in tests
jest.mock('./config/firebase.js', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn()
  },
  db: {},
  storage: {}
}), { virtual: true })

// EmailJS service mock for contact form functionality
// Prevents actual email sending during test execution
jest.mock('@emailjs/browser', () => ({
  send: jest.fn(),
  init: jest.fn()
}))

// Chart.js library mock for data visualisation components
// Avoids canvas rendering complexities in test environment
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn()
  }
}))

// ResizeObserver API mock for responsive component testing
// Provides essential interface without actual resize observation
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// localStorage API mock for persistent state testing
// Simulates browser storage without actual persistence
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock

// Media query matching mock for responsive design testing
// Provides consistent behaviour across different test scenarios
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    // Default non-matching state for predictable testing
    matches: false,
    media: query,
    onchange: null,
    // Legacy listener methods
    addListener: jest.fn(),
    removeListener: jest.fn(),
    // Modern event listener methods
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})
