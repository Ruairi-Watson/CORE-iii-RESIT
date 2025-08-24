// Comprehensive unit tests for DarkModeToggle theme switching component
// Validates theme persistence, state management, and user interaction behaviour
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DarkModeToggle from '../DarkModeToggle.jsx'

describe('DarkModeToggle', () => {
  beforeEach(() => {
    // Reset localStorage state before each test for isolation
    localStorage.clear()
    // Remove any existing theme classes from document
    document.documentElement.classList.remove('dark')
    // Clear all Jest mocks for consistent test environment
    jest.clearAllMocks()
  })

  test('should render dark mode toggle button', () => {
    render(<DarkModeToggle />)
    
    // Verify theme toggle button is present in the document
    const button = screen.getByRole('button', { name: /toggle dark mode/i })
    expect(button).toBeInTheDocument()
  })

  test('should initialize in light mode by default', () => {
    render(<DarkModeToggle />)
    
    // Verify default light mode state without stored preferences
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  test('should initialize in dark mode when localStorage has dark mode saved', () => {
    // Pre-set dark mode preference in browser storage
    localStorage.setItem('darkMode', 'true')
    
    render(<DarkModeToggle />)
    
    // Verify dark theme restoration from stored preference
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  test('should toggle to dark mode when clicked', () => {
    render(<DarkModeToggle />)
    
    // Locate and interact with theme toggle button
    const button = screen.getByRole('button', { name: /toggle dark mode/i })
    fireEvent.click(button)
    
    // Verify dark theme activation and persistence
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('darkMode')).toBe('true')
  })

  test('should toggle back to light mode when clicked again', () => {
    // Pre-configure dark mode state
    localStorage.setItem('darkMode', 'true')
    document.documentElement.classList.add('dark')
    
    render(<DarkModeToggle />)
    
    // Trigger theme toggle from dark to light
    const button = screen.getByRole('button', { name: /toggle dark mode/i })
    fireEvent.click(button)
    
    // Verify light theme restoration and storage update
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('darkMode')).toBe('false')
  })

  test('should display correct icons based on theme state', () => {
    render(<DarkModeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle dark mode/i })
    
    // Locate theme-specific icon elements within button
    const sunIcon = button.querySelector('svg:first-child')
    const moonIcon = button.querySelector('svg:last-child')
    
    // Verify initial light mode icon visibility
    expect(sunIcon).toHaveClass('opacity-100')
    expect(moonIcon).toHaveClass('opacity-0')
    
    // Toggle to dark mode and verify icon transition
    fireEvent.click(button)
    
    // Confirm dark mode icon visibility swap
    expect(sunIcon).toHaveClass('opacity-0')
    expect(moonIcon).toHaveClass('opacity-100')
  })

  test('should handle localStorage values correctly', () => {
    // Test explicit false string value in localStorage
    localStorage.setItem('darkMode', 'false')
    render(<DarkModeToggle />)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    
    // Reset document state and test true string value
    document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', 'true')
    
    // Verify component handles string boolean values correctly
    render(<DarkModeToggle />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  test('should have proper accessibility attributes', () => {
    render(<DarkModeToggle />)
    
    // Verify semantic accessibility labelling for screen readers
    const button = screen.getByRole('button', { name: /toggle dark mode/i })
    expect(button).toHaveAttribute('aria-label', 'Toggle dark mode')
  })

  test('should apply correct CSS classes', () => {
    render(<DarkModeToggle />)
    
    // Verify essential styling classes are applied correctly
    const button = screen.getByRole('button', { name: /toggle dark mode/i })
    expect(button).toHaveClass('relative', 'p-2', 'rounded-xl')
  })

  test('should handle multiple rapid clicks correctly', () => {
    render(<DarkModeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle dark mode/i })
    
    // Simulate rapid successive theme toggles
    fireEvent.click(button) // Light -> Dark
    fireEvent.click(button) // Dark -> Light
    fireEvent.click(button) // Light -> Dark
    
    // Verify final state matches expected sequence result
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('darkMode')).toBe('true')
  })
})
