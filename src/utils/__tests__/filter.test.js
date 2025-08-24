// Comprehensive unit tests for department filtering utilities
// Validates leaderboard eligibility rules and department exclusion logic
import { isDepartmentAllowed, filterLeaderboardEligibleUsers } from '../filter.js'

describe('Department Filter Utilities', () => {
  describe('isDepartmentAllowed', () => {
    test('should return false for null or undefined department', () => {
      // Verify null input handling for robust error prevention
      expect(isDepartmentAllowed(null)).toBe(false)
      expect(isDepartmentAllowed(undefined)).toBe(false)
    })

    test('should return false for non-string input', () => {
      // Verify type safety for non-string department values
      expect(isDepartmentAllowed(123)).toBe(false)
      expect(isDepartmentAllowed({})).toBe(false)
      expect(isDepartmentAllowed([])).toBe(false)
    })

    test('should return false for empty string', () => {
      // Verify empty string rejection for data integrity
      expect(isDepartmentAllowed('')).toBe(false)
      // Whitespace-only strings normalised to empty and properly rejected
      expect(isDepartmentAllowed('   ')).toBe(false)
    })

    test('should exclude HR departments (case insensitive)', () => {
      // Verify HR department exclusion across various naming conventions
      expect(isDepartmentAllowed('HR')).toBe(false)
      expect(isDepartmentAllowed('hr')).toBe(false)
      expect(isDepartmentAllowed('H.R.')).toBe(false)
      expect(isDepartmentAllowed('Human Resources')).toBe(false)
      expect(isDepartmentAllowed('HUMAN RESOURCES')).toBe(false)
      expect(isDepartmentAllowed('Personnel')).toBe(false)
    })

    test('should exclude management departments', () => {
      // Verify management hierarchy exclusion for evaluation neutrality
      expect(isDepartmentAllowed('Management')).toBe(false)
      expect(isDepartmentAllowed('MGMT')).toBe(false)
      expect(isDepartmentAllowed('Executive')).toBe(false)
      expect(isDepartmentAllowed('Senior Management')).toBe(false)
      expect(isDepartmentAllowed('Leadership')).toBe(false)
    })

    test('should exclude admin departments', () => {
      expect(isDepartmentAllowed('Admin')).toBe(false)
      expect(isDepartmentAllowed('Administration')).toBe(false)
      expect(isDepartmentAllowed('Administrative')).toBe(false)
      expect(isDepartmentAllowed('Office Admin')).toBe(false)
    })

    test('should allow eligible departments', () => {
      expect(isDepartmentAllowed('Engineering')).toBe(true)
      expect(isDepartmentAllowed('Marketing')).toBe(true)
      expect(isDepartmentAllowed('Sales')).toBe(true)
      expect(isDepartmentAllowed('Design')).toBe(true)
      expect(isDepartmentAllowed('Customer Service')).toBe(true)
      expect(isDepartmentAllowed('Finance')).toBe(true)
      expect(isDepartmentAllowed('Operations')).toBe(true)
    })

    test('should handle whitespace and case variations', () => {
      expect(isDepartmentAllowed('  Engineering  ')).toBe(true)
      expect(isDepartmentAllowed('ENGINEERING')).toBe(true)
      expect(isDepartmentAllowed('engineering')).toBe(true)
      expect(isDepartmentAllowed('  hr  ')).toBe(false)
    })
  })

  describe('filterLeaderboardEligibleUsers', () => {
    const mockUsers = [
      {
        id: '1',
        name: 'John Doe',
        department: 'Engineering',
        role: 'employee'
      },
      {
        id: '2',
        name: 'Jane Smith',
        department: 'HR',
        role: 'employee'
      },
      {
        id: '3',
        name: 'Bob Johnson',
        department: 'Marketing',
        role: 'admin'
      },
      {
        id: '4',
        name: 'Alice Wilson',
        department: 'Management',
        role: 'employee'
      },
      {
        id: '5',
        name: 'Charlie Brown',
        department: 'Sales',
        role: 'employee'
      }
    ]

    test('should filter out HR departments', () => {
      const result = filterLeaderboardEligibleUsers(mockUsers)
      const hrUser = result.find(user => user.department === 'HR')
      expect(hrUser).toBeUndefined()
    })

    test('should filter out management departments', () => {
      const result = filterLeaderboardEligibleUsers(mockUsers)
      const managementUser = result.find(user => user.department === 'Management')
      expect(managementUser).toBeUndefined()
    })

    test('should filter out admin roles', () => {
      const result = filterLeaderboardEligibleUsers(mockUsers)
      const adminUser = result.find(user => user.role === 'admin')
      expect(adminUser).toBeUndefined()
    })

    test('should keep eligible users', () => {
      const result = filterLeaderboardEligibleUsers(mockUsers)
      expect(result).toHaveLength(2)
      expect(result.find(user => user.name === 'John Doe')).toBeDefined()
      expect(result.find(user => user.name === 'Charlie Brown')).toBeDefined()
    })

    test('should handle empty array', () => {
      const result = filterLeaderboardEligibleUsers([])
      expect(result).toEqual([])
    })

    test('should handle null/undefined input', () => {
      expect(filterLeaderboardEligibleUsers(null)).toEqual([])
      expect(filterLeaderboardEligibleUsers(undefined)).toEqual([])
    })

    test('should handle users without department property', () => {
      const usersWithoutDept = [
        { id: '1', name: 'Test User', role: 'employee' }
      ]
      const result = filterLeaderboardEligibleUsers(usersWithoutDept)
      expect(result).toEqual([])
    })
  })
})
