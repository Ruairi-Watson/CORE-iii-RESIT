// Leaderboard context for leaderboard state
// Supplies leaderboard data and refresh function
import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";

// Creates leaderboard context with default values
const LeaderboardContext = createContext({
  leaderboard: [],
  refreshLeaderboard: async () => {},
});

// Provider component for leaderboard context
export const LeaderboardProvider = ({ children }) => {
  // Stores leaderboard entries
  const [leaderboard, setLeaderboard] = useState([]);

  // Fetches and updates leaderboard data from Firestore
  const refreshLeaderboard = async () => {
    const q = query(collection(db, "leaderboard"), orderBy("score", "desc"));
    const querySnapshot = await getDocs(q);
    setLeaderboard(
      querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  };

  // Sets up real-time leaderboard listener on mount
  useEffect(() => {
    const q = query(collection(db, "leaderboard"), orderBy("score", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log('Real-time leaderboard update received');
      setLeaderboard(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    }, (error) => {
      console.error('Error with leaderboard real-time listener:', error);
      // Fallback to manual refresh on error
      refreshLeaderboard();
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // Supplies context values to children
  return (
    <LeaderboardContext.Provider value={{ leaderboard, refreshLeaderboard }}>
      {children}
    </LeaderboardContext.Provider>
  );
};

// Custom hook to access leaderboard context
export const useLeaderboard = () => useContext(LeaderboardContext); 