// Unit tests for LeaderboardContext
import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { LeaderboardProvider, useLeaderboard } from '../LeaderboardContext.jsx'
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore'

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn()
}))

// Firebase is mocked globally in setupTests.js

// Test component to consume the leaderboard context
const TestConsumer = () => {
  const { leaderboard, refreshLeaderboard } = useLeaderboard()
  
  return (
    <div data-testid="leaderboard-consumer">
      <div data-testid="leaderboard-count">{leaderboard.length}</div>
      <div data-testid="leaderboard-entries">
        {leaderboard.map(entry => (
          <div key={entry.id} data-testid={`entry-${entry.id}`}>
            {entry.name} - {entry.score}
          </div>
        ))}
      </div>
      <button onClick={refreshLeaderboard} data-testid="refresh-button">
        Refresh
      </button>
    </div>
  )
}

describe('LeaderboardContext', () => {
  const mockLeaderboardData = [
    { id: '1', name: 'John Doe', score: 1500 },
    { id: '2', name: 'Jane Smith', score: 1200 },
    { id: '3', name: 'Bob Johnson', score: 1000 }
  ]

  let consoleLogSpy, consoleErrorSpy

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock console.log and console.error
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (consoleLogSpy) consoleLogSpy.mockRestore()
    if (consoleErrorSpy) consoleErrorSpy.mockRestore()
  })

  test('should provide leaderboard context to children', () => {
    // Mock onSnapshot to not trigger immediately
    onSnapshot.mockImplementation(() => () => {})
    
    render(
      <LeaderboardProvider>
        <TestConsumer />
      </LeaderboardProvider>
    )
    
    expect(screen.getByTestId('leaderboard-consumer')).toBeInTheDocument()
    expect(screen.getByTestId('leaderboard-count')).toHaveTextContent('0')
  })

  test('should set up real-time listener on mount', () => {
    const mockUnsubscribe = jest.fn()
    onSnapshot.mockImplementation(() => mockUnsubscribe)
    
    render(
      <LeaderboardProvider>
        <TestConsumer />
      </LeaderboardProvider>
    )
    
    expect(query).toHaveBeenCalled()
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'leaderboard')
    expect(orderBy).toHaveBeenCalledWith('score', 'desc')
    expect(onSnapshot).toHaveBeenCalled()
  })

  test('should update leaderboard when real-time data changes', async () => {
    const mockQuerySnapshot = {
      docs: mockLeaderboardData.map(item => ({
        id: item.id,
        data: () => ({ name: item.name, score: item.score })
      }))
    }
    
    onSnapshot.mockImplementation((query, callback) => {
      // Simulate real-time update
      setTimeout(() => callback(mockQuerySnapshot), 0)
      return () => {}
    })
    
    render(
      <LeaderboardProvider>
        <TestConsumer />
      </LeaderboardProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('leaderboard-count')).toHaveTextContent('3')
      expect(screen.getByTestId('entry-1')).toHaveTextContent('John Doe - 1500')
      expect(screen.getByTestId('entry-2')).toHaveTextContent('Jane Smith - 1200')
      expect(screen.getByTestId('entry-3')).toHaveTextContent('Bob Johnson - 1000')
    })
    
    expect(console.log).toHaveBeenCalledWith('Real-time leaderboard update received')
  })

  test('should handle real-time listener errors', async () => {
    const mockError = new Error('Firestore connection error')
    const mockQuerySnapshot = {
      docs: mockLeaderboardData.map(item => ({
        id: item.id,
        data: () => ({ name: item.name, score: item.score })
      }))
    }
    
    onSnapshot.mockImplementation((query, callback, errorCallback) => {
      // Simulate error
      setTimeout(() => errorCallback(mockError), 0)
      return () => {}
    })
    
    // Mock getDocs for fallback
    getDocs.mockResolvedValue(mockQuerySnapshot)
    
    render(
      <LeaderboardProvider>
        <TestConsumer />
      </LeaderboardProvider>
    )
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error with leaderboard real-time listener:',
        mockError
      )
    })
  })

  test('should refresh leaderboard manually when refreshLeaderboard is called', async () => {
    const mockQuerySnapshot = {
      docs: mockLeaderboardData.map(item => ({
        id: item.id,
        data: () => ({ name: item.name, score: item.score })
      }))
    }
    
    onSnapshot.mockImplementation(() => () => {})
    getDocs.mockResolvedValue(mockQuerySnapshot)
    
    render(
      <LeaderboardProvider>
        <TestConsumer />
      </LeaderboardProvider>
    )
    
    const refreshButton = screen.getByTestId('refresh-button')
    
    await act(async () => {
      refreshButton.click()
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('leaderboard-count')).toHaveTextContent('3')
      expect(getDocs).toHaveBeenCalled()
    })
  })

  test('should handle empty leaderboard data', async () => {
    const mockQuerySnapshot = {
      docs: []
    }
    
    onSnapshot.mockImplementation((query, callback) => {
      setTimeout(() => callback(mockQuerySnapshot), 0)
      return () => {}
    })
    
    render(
      <LeaderboardProvider>
        <TestConsumer />
      </LeaderboardProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('leaderboard-count')).toHaveTextContent('0')
    })
  })

  test('should clean up listener on unmount', () => {
    const mockUnsubscribe = jest.fn()
    onSnapshot.mockImplementation(() => mockUnsubscribe)
    
    const { unmount } = render(
      <LeaderboardProvider>
        <TestConsumer />
      </LeaderboardProvider>
    )
    
    unmount()
    
    expect(mockUnsubscribe).toHaveBeenCalled()
  })


})
