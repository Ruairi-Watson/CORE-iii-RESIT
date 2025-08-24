// Unit tests for badge utility functions
import { getBadgeType } from '../badgeUtils.ts'

describe('Badge Utilities', () => {
  describe('getBadgeType', () => {
    test('should return "top10" for users in top 10 positions', () => {
      const mockEntry = { score: 500 }
      
      // Test first 10 positions
      for (let i = 0; i < 10; i++) {
        expect(getBadgeType(mockEntry, i)).toBe('top10')
      }
    })

    test('should return "consistent" for high-scoring users outside top 10', () => {
      const highScoreEntry = { score: 1500 }
      expect(getBadgeType(highScoreEntry, 15)).toBe('consistent')
    })

    test('should return "consistent" for users with score greater than 1000', () => {
      const highScoreEntry = { score: 1001 }
      expect(getBadgeType(highScoreEntry, 20)).toBe('consistent')
    })

    test('should return undefined for low-scoring users outside top 10', () => {
      const lowScoreEntry = { score: 800 }
      expect(getBadgeType(lowScoreEntry, 15)).toBeUndefined()
    })

    test('should prioritise position over score for top 10', () => {
      const lowScoreEntry = { score: 100 }
      expect(getBadgeType(lowScoreEntry, 5)).toBe('top10')
    })

    test('should handle edge cases', () => {
      // Test position 10 (should not get top10 badge)
      const entry = { score: 1200 }
      expect(getBadgeType(entry, 10)).toBe('consistent')
      
      // Test position 9 (should get top10 badge regardless of score)
      expect(getBadgeType(entry, 9)).toBe('top10')
    })

    test('should handle missing or invalid score property', () => {
      const noScoreEntry = {}
      expect(getBadgeType(noScoreEntry, 15)).toBeUndefined()
      
      const nullScoreEntry = { score: null }
      expect(getBadgeType(nullScoreEntry, 15)).toBeUndefined()
      
      const stringScoreEntry = { score: 'invalid' }
      expect(getBadgeType(stringScoreEntry, 15)).toBeUndefined()
    })

    test('should handle negative indices', () => {
      const entry = { score: 1500 }
      // Negative indices are still less than 10, so should get top10 badge
      expect(getBadgeType(entry, -1)).toBe('top10')
    })

    test('should handle very large indices', () => {
      const entry = { score: 1500 }
      expect(getBadgeType(entry, 1000)).toBe('consistent')
    })
  })
})
