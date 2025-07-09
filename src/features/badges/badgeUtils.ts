import { LeaderboardEntry } from "../leaderboard/LeaderboardContext";

export function getBadgeType(entry: LeaderboardEntry, index: number): string | undefined {
  if (index < 10) return "top10";
  // Add more badge logic as needed
  if (entry.score > 1000) return "consistent";
  return undefined;
} 