import { useState, useEffect } from "react";

export interface Ball {
  type: "dot" | "run" | "wicket" | "wide" | "noBall";
  runs?: number;
  countedBall?: boolean;
}

export interface User {
  visitorId: string;
  displayName: string;
  role: "admin" | "viewer";
}

export interface MatchData {
  matchCode: string;
  createdBy: string;
  users: User[];
  settings?: {
    overs: number;
    players: number;
  };
  score?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  ballHistory?: Ball[];
  currentOverBalls?: string[];
  isAdmin?: boolean;
}

export const useMatchData = (matchId: string) => {
  const [match, setMatch] = useState<MatchData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overs, setOvers] = useState(0);
  const [ballHistory, setBallHistory] = useState<Ball[]>([]);
  const [currentOverBalls, setCurrentOverBalls] = useState<string[]>([]);

  useEffect(() => {
    const storedMatch = sessionStorage.getItem(`match-${matchId}`);
    if (storedMatch) {
      try {
        const matchData = JSON.parse(storedMatch) as MatchData;
        setMatch(matchData);
        setUsers(matchData.users || []);
        setIsAdmin(matchData.isAdmin || false);
        if (matchData.score) {
          setScore(matchData.score.runs || 0);
          setWickets(matchData.score.wickets || 0);
          setOvers(matchData.score.overs || 0);
        }
        setBallHistory(matchData.ballHistory || []);
        setCurrentOverBalls(matchData.currentOverBalls || []);
      } catch {
        setError("Error loading match data");
      }
    } else {
      setError("Match not found. Please go back and create/join a new match.");
    }
    setLoading(false);
  }, [matchId]);

  const updateMatchData = (data: any) => {
    sessionStorage.setItem(`match-${matchId}`, JSON.stringify(data));
    setMatch(data);
    setUsers(data.users || []);
    if (data.score) {
      setScore(data.score.runs || 0);
      setWickets(data.score.wickets || 0);
      setOvers(data.score.overs || 0);
    }
    setBallHistory(data.ballHistory || []);
    setCurrentOverBalls(data.currentOverBalls || []);
  };

  const updateScore = (newScore: number, newWickets: number, newOvers: number) => {
    setScore(newScore);
    setWickets(newWickets);
    setOvers(newOvers);
    // Persist to sessionStorage
    if (match) {
      const updated = {
        ...match,
        score: {
          ...match.score,
          runs: newScore,
          wickets: newWickets,
          overs: newOvers,
        },
      };
      sessionStorage.setItem(`match-${matchId}`, JSON.stringify(updated));
    }
  };

  const updateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    // Persist to sessionStorage
    if (match) {
      const updated = { ...match, users: newUsers };
      sessionStorage.setItem(`match-${matchId}`, JSON.stringify(updated));
    }
  };

  const updateBallHistory = (newBallHistory: Ball[], newCurrentOverBalls: string[] = []) => {
    setBallHistory(newBallHistory);
    setCurrentOverBalls(newCurrentOverBalls);
    // Persist to sessionStorage
    if (match) {
      const updated = {
        ...match,
        ballHistory: newBallHistory,
        currentOverBalls: newCurrentOverBalls,
      };
      sessionStorage.setItem(`match-${matchId}`, JSON.stringify(updated));
    }
  };

  return {
    match,
    users,
    isAdmin,
    loading,
    error,
    score,
    wickets,
    overs,
    ballHistory,
    currentOverBalls,
    updateMatchData,
    updateScore,
    updateUsers,
    updateBallHistory,
  };
};
