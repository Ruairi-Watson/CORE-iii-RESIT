import '@testing-library/jest-dom'

// Suppress React Router deprecation warnings
const originalConsoleWarn = console.warn
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('React Router Future Flag Warning') ||
     args[0].includes('v7_startTransition') ||
     args[0].includes('v7_relativeSplatPath'))
  ) {
    return // Suppress React Router v7 deprecation warnings
  }
  originalConsoleWarn.apply(console, args)
}

// Firebase mocking
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  app: {
    options: {
      projectId: 'test-project-id'
    }
  }
}

const mockDb = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn()
}

const mockStorage = {}

jest.mock('./firebase.js', () => ({
  auth: mockAuth,
  db: mockDb,
  storage: mockStorage
}), { virtual: true })

// TypeScript Firebase module variant mock
jest.mock('./firebase.ts', () => ({
  auth: mockAuth,
  db: mockDb,
  storage: mockStorage
}), { virtual: true })

// Firebase configuration module mock
jest.mock('./config/firebase.js', () => ({
  auth: mockAuth,
  db: mockDb,
  storage: mockStorage
}), { virtual: true })

// EmailJS mock
jest.mock('@emailjs/browser', () => ({
  send: jest.fn(),
  init: jest.fn()
}))

// Chart.js mock
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn()
  }
}))

// ResizeObserver mock
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock

// matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})
