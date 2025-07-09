// Leaderboard table component
// Lists leaderboard entries with rank, name, and score
import React from 'react'
import { useLeaderboard } from './LeaderboardContext'

// Renders the leaderboard table
const LeaderboardTable = () => {
  // Retrieves leaderboard data from context
  const { leaderboard } = useLeaderboard()

  return (
    // Table displaying leaderboard entries
    <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <thead>
        <tr className="bg-primary-50 dark:bg-primary-700 text-left">
          {/* Table headers for rank, name, and score */}
          <th className="p-3">Rank</th>
          <th className="p-3">Name</th>
          <th className="p-3">Score</th>
        </tr>
      </thead>
      <tbody>
        {/* Maps leaderboard entries to table rows */}
        {leaderboard.map((entry, idx) => (
          <tr key={entry.id} className="border-b last:border-none">
            <td className="p-3">{idx + 1}</td>
            <td className="p-3">{entry.name}</td>
            <td className="p-3">{entry.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default LeaderboardTable 