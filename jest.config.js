// Jest configuration for React testing environment
// Provides comprehensive testing setup with TypeScript support and mocking capabilities
export default {
  // Browser-like environment for DOM testing
  testEnvironment: 'jsdom',
  
  // Global setup file executed after Jest environment initialisation
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Module path mapping for imports and static assets
  moduleNameMapper: {
    // CSS/SCSS files resolved to identity proxy for styling tests
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Absolute path alias mapping for cleaner imports
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Source code transformation configuration
  transform: {
    // JavaScript, JSX, TypeScript, and TSX file processing
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        // ES6+ features compilation targeting current Node.js version
        ['@babel/preset-env', { targets: { node: 'current' } }],
        // React JSX transformation with automatic runtime
        ['@babel/preset-react', { runtime: 'automatic' }],
        // TypeScript compilation without type checking
        '@babel/preset-typescript'
      ]
    }]
  },
  
  // Supported file extensions for module resolution
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Test file discovery patterns
  testMatch: [
    // Tests located in __tests__ directories
    '<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)',
    // Files with .test or .spec suffixes
    '<rootDir>/src/**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  
  // Coverage collection configuration
  collectCoverageFrom: [
    // Include all source files for coverage analysis
    'src/**/*.{js,jsx,ts,tsx}',
    // Exclude TypeScript declaration files
    '!src/**/*.d.ts',
    // Exclude application entry point
    '!src/main.jsx',
    // Exclude Vite environment types
    '!src/vite-env.d.ts'
  ],
  
  // Coverage output formats
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Coverage report destination directory
  coverageDirectory: 'coverage'
}
