"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/context/SocketContext";

/**
 * MATCH EVENT PAGE: /match/[id] (OPTIMIZED)
 * 
 * Real-time match scoreboard where:
 * - Admin sees controls to update score
 * - Viewers see live updates
 * - Everyone sees live user list
 * 
 * Socket.io events listened:
 * - userJoined: Someone joined the room
 * - userLeft: Someone left the room
 * - userListUpdated: User list changed
 * - scoreUpdated: (future) Score was updated
 * 
 * Optimizations:
 * - useCallback for event handlers (prevents recreation on every render)
 * - Removed console.logs (use dev tools instead)
 * - Lazy sessionStorage parsing
 */

interface User {
  visitorId: string;
  displayName: string;
  role: "admin" | "viewer";
}

interface MatchData {
  matchCode: string;
  createdBy: string;
  users: User[];
  settings?: {
    overs: number;
    players: number;
  };
}

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const { socket, isConnected } = useSocket();

  // Match State
  const [match, setMatch] = useState<MatchData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Score State (for future use)
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overs, setOvers] = useState(0);

  // Event handlers wrapped in useCallback to prevent recreation
  const handleUserJoined = useCallback(
    (data: { newUser: User; totalUsers: number; allUsers: User[] }) => {
      setUsers(data.allUsers);
    },
    []
  );

  const handleUserLeft = useCallback(
    (data: { leftUser: string; totalUsers: number; allUsers: User[] }) => {
      setUsers(data.allUsers);
    },
    []
  );

  const handleUserListUpdated = useCallback(
    (data: { users: User[]; totalUsers: number }) => {
      setUsers(data.users);
    },
    []
  );
  const updateScore = useCallback(
    (data:any)=>{

    },[]
  )

  /**
   * Effect 1: Load match data from sessionStorage IMMEDIATELY
   * This should not wait for socket connection
   * ✅ OPTIMIZED: Load data on mount, don't wait for socket
   */
  useEffect(() => {
    // Load match data from sessionStorage immediately
    const storedMatch = sessionStorage.getItem(`match-${matchId}`);
    if (storedMatch) {
      try {
        const matchData = JSON.parse(storedMatch);
        setMatch(matchData);
        setUsers(matchData.users || []);
        setIsAdmin(matchData.isAdmin);
      } catch {
        setError("Error loading match data");
      }
    } else {
      setError(
        "Match not found. Please go back and create/join a new match."
      );
    }
    setLoading(false);
  }, [matchId]);

  /**
   * Effect 2: Register Socket.io listeners AFTER data is loaded
   * This effect runs after socket connects, not blocking initial render
   */
  useEffect(() => {
    if (!socket || !isConnected || !matchId) return;

    // Socket is now connected - register listeners for real-time updates
    // Register listeners with useCallback references
    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handleUserLeft);
    socket.on("userListUpdated", handleUserListUpdated);
    socket.on("updatedScore", updateScore)

    // Cleanup listeners on unmount
    return () => {
      socket.off("userJoined", handleUserJoined);
      socket.off("userLeft", handleUserLeft);
      socket.off("userListUpdated", handleUserListUpdated);
    };
  }, [socket, isConnected, matchId, handleUserJoined, handleUserLeft, handleUserListUpdated]);

  //working copy button
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text:string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };


  /**
   * Handle Leave Match
   * Emits leaveMatch event to server
   */
  const handleLeaveMatch = () => {
    if (socket && isConnected) {
      socket.emit("leaveMatch");
      // In a real app, redirect to home page
      router.push("/");

    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white">Loading match...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-8 max-w-md">
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">No match found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-amber-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-300">
                Match {match.matchCode}
              </h1>
              <p className="text-slate-400 text-sm mt-2">
                Created by: {match.createdBy}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                ></div>
                <span className="text-xs text-slate-400">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              {isAdmin && (
                <span className="inline-block bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full text-xs">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Scoreboard */}
          <div className="md:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-8">Scoreboard</h2>

              {/* Score Card */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-white">{score}</div>
                  <div className="text-blue-200 text-sm mt-2">Runs</div>
                </div>
                <div className="bg-linear-to-br from-red-600 to-red-700 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-white">{wickets}</div>
                  <div className="text-red-200 text-sm mt-2">Wickets</div>
                </div>
                <div className="bg-linear-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-white">{overs}</div>
                  <div className="text-purple-200 text-sm mt-2">Overs</div>
                </div>
                <div className="bg-linear-to-br from-amber-600 to-amber-700 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-white">
                    {wickets === 0 ? score : "-"}
                  </div>
                  <div className="text-amber-200 text-sm mt-2">Rate</div>
                </div>
              </div>

              {/* Admin Controls (for Step 2) */}
              {isAdmin && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-white font-bold mb-4">Update Score</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition">
                      +1 Run
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">
                      +2 Runs
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition">
                      +3 Runs
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition col-span-2">
                      Wicket
                    </button>
                    <button className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 rounded-lg transition">
                      Reset
                    </button>
                  </div>
                  <p className="text-slate-400 text-xs mt-3">
                    Note: Admin score updates will broadcast to all viewers in
                    real-time! ⚡
                  </p>
                </div>
              )}
            </div>

            {/* Match Info */}
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Match Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Total Overs</p>
                  <p className="text-white font-bold">
                    {match.settings?.overs || 5}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Players</p>
                  <p className="text-white font-bold">
                    {match.settings?.players || 11}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Users Panel */}
          <div className="md:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl sticky top-8">
              <h3 className="text-xl font-bold text-white mb-4">
                Users ({users.length})
              </h3>

              {/* User List */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.visitorId}
                    className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-medium text-sm">
                        {user.displayName}
                      </p>
                      {user.role === "admin" && (
                        <p className="text-amber-400 text-xs">Admin</p>
                      )}
                      {user.role === "viewer" && (
                        <p className="text-slate-400 text-xs">Viewer</p>
                      )}
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${user.role === "admin" ? "bg-amber-400" : "bg-green-400"
                        }`}
                    ></div>
                  </div>
                ))}
              </div>

              {/* Leave Button */}
              <button
                onClick={handleLeaveMatch}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition"
              >
                Leave Match
              </button>

              {/* Match Code Copy */}
              <div className="mt-4 bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-2">Share this code:</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-800 rounded px-2 py-1">
                    <p className="text-white font-mono text-lg">
                      {match.matchCode}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(match.matchCode)}
                    className={`${copied ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'
                      } text-white px-3 py-1 rounded text-sm transition`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
