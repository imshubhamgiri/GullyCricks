"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";

/**
 * HOME PAGE: /
 * 
 * Two options:
 * 1. Create Match - Admin creates a new match
 * 2. Join Match - Viewer joins existing match with code
 */

export default function Home() {
  const router = useRouter();
  const { socket, isConnected, error: socketError } = useSocket();

  // UI State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [adminName, setAdminName] = useState("");
  const [matchCode, setMatchCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  
  // Cricket Match Settings States
  const [overs, setOvers] = useState(5);
  const [players, setPlayers] = useState(4);
  const [wideRuns, setWideRuns] = useState(1);
  const [noBallRuns, setNoBallRuns] = useState(1);

  /**
   * Handle Create Match
   * Emits: createMatch event to Socket.io
   * Response callback sets matchCode and navigates to match page
   */
  const handleCreateMatch = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!adminName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!isConnected) {
      setError("Not connected to server. Please refresh the page.");
      return;
    }

    setLoading(true);

    // Emit createMatch event to backend
    socket?.emit(
      "createMatch",
      { 
        adminName: adminName.trim(),
        settings: {
          overs,
          players,
          wideRuns,
          noBallRuns,
        }
      },
      (response: any) => {
        setLoading(false);

        if (response.success) {
          // Match created successfully
          // Store match data in sessionStorage for the match page
          const matchData = {
            matchCode: response.matchCode,
            createdBy: adminName,
            users: [
              {
                visitorId: socket?.id,
                displayName: adminName,
                role: "admin",
              },
            ],
            isAdmin: true,
            settings: {
              overs,
              players,
              wideRuns,
              noBallRuns,
            },
          };
          sessionStorage.setItem(
            `match-${response.matchId}`,
            JSON.stringify(matchData)
          );

          // Navigate to match page with ID
          router.push(`/match/${response.matchId}`);
        } else {
          setError(response.error || "Failed to create match");
        }
      }
    );
  };

  /**
   * Handle Join Match
   * Emits: joinMatch event to Socket.io
   * Response callback contains match data
   */
  const handleJoinMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!matchCode.trim() || !playerName.trim()) {
      setError("Please enter match code and your name");
      return;
    }

    if (!isConnected) {
      setError("Not connected to server. Please refresh the page.");
      return;
    }

    setLoading(true);

    // Emit joinMatch event to backend
    socket?.emit(
      "joinMatch",
      {
        matchCode: matchCode.trim().toUpperCase(),
        playerName: playerName.trim(),
      },
      (response: any) => {
        setLoading(false);

        if (response.success) {
          // Match joined successfully
          // Store match data in sessionStorage for the match page
          const matchData = {
            matchCode: response.match.matchCode,
            createdBy: response.match.createdBy,
            users: response.match.users,
            isAdmin: false,
            settings: response.match.settings,
          };
          sessionStorage.setItem(
            `match-${response.matchId}`,
            JSON.stringify(matchData)
          );

          // Navigate to match page with ID
          router.push(`/match/${response.matchId}`);
        } else {
          setError(response.error || "Failed to join match");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-amber-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-300">
            GullyCricks
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Real-time Cricket Scoring Platform
          </p>
          {/* Connection Status */}
          <div className="mt-4 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-xs text-slate-400">
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* CREATE MATCH CARD */}
          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl hover:border-amber-500/30 transition">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🏏</div>
              <h2 className="text-2xl font-bold text-white">Create Match</h2>
              <p className="text-slate-400 text-sm mt-2">
                Set up a new match and invite others
              </p>
            </div>

            {!showCreateForm ? (
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setError(null);
                }}
                disabled={!isConnected}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
              >
                Create New Match
              </button>
            ) : (
              <form onSubmit={handleCreateMatch} className="space-y-4">
                {/* Admin Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Name (Admin)
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>

                {/* Match Settings */}
                <div className="bg-slate-900/30 border border-slate-600/30 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-amber-300">Match Settings</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Overs
                      </label>
                      <input
                        type="number"
                        value={overs}
                        onChange={(e) => setOvers(Number(e.target.value) || 0)}
                        min="1"
                        max="50"
                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Players
                      </label>
                      <input
                        type="number"
                        value={players}
                        onChange={(e) => setPlayers(Number(e.target.value) || 0)}
                        min="1"
                        max="15"
                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Wide Runs
                      </label>
                      <input
                        type="number"
                        value={wideRuns}
                        onChange={(e) => setWideRuns(Number(e.target.value) || 0)}
                        min="0"
                        max="10"
                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        No Ball Runs
                      </label>
                      <input
                        type="number"
                        value={noBallRuns}
                        onChange={(e) => setNoBallRuns(Number(e.target.value) || 0)}
                        min="0"
                        max="10"
                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading || !isConnected}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setAdminName("");
                      setOvers(5);
                      setPlayers(4);
                      setWideRuns(1);
                      setNoBallRuns(1);
                      setError(null);
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* JOIN MATCH CARD */}
          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl hover:border-amber-500/30 transition">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-white">Join Match</h2>
              <p className="text-slate-400 text-sm mt-2">
                Enter code to join existing match
              </p>
            </div>

            {!showJoinForm ? (
              <button
                onClick={() => {
                  setShowJoinForm(true);
                  setError(null);
                }}
                disabled={!isConnected}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
              >
                Join Match
              </button>
            ) : (
              <form onSubmit={handleJoinMatch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Match Code
                  </label>
                  <input
                    type="text"
                    value={matchCode}
                    onChange={(e) => setMatchCode(e.target.value.toUpperCase())}
                    placeholder="e.g., ABC123"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading || !isConnected}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
                  >
                    {loading ? "Joining..." : "Join"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinForm(false);
                      setMatchCode("");
                      setPlayerName("");
                      setError(null);
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-2xl mx-auto bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
          <h3 className="text-white font-bold mb-4">How it works:</h3>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="flex gap-3">
              <span className="text-amber-400">1.</span>
              <span>Create a new match and share the code with your friends</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400">2.</span>
              <span>They join using the match code and their name</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400">3.</span>
              <span>
                Everyone sees real-time score updates instantly via Socket.io
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400">4.</span>
              <span>Admin updates score, viewers see it immediately</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
