"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import {  useCallback, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import {
  useMatchData,
  useMatchSocket,
  useCopyToClipboard,
} from "@/hooks";
import {
  LoadingState,
  ErrorState,
} from "@/components/ui";
import {
  Scoreboard,
  MatchInfo,
  UsersPanel,
  DashboardHeader,
  BallHistory,
} from "@/components/dashboard";

/**
 * MATCH EVENT PAGE: /match/[id]
 * 
 * Real-time match scoreboard with:
 * - Admin controls to update score
 * - Viewers see live updates
 * - Live user list and collaboration
 */

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const { socket, isConnected } = useSocket();

  // Custom hooks
  const matchData = useMatchData(matchId);
  const { copied, handleCopy } = useCopyToClipboard();
  const [scoreUpdateError, setScoreUpdateError] = useState<string | null>(null);
  const [updatingScore, setUpdatingScore] = useState(false);

  // Socket event handlers
  const handleUserJoined = useCallback(
    (data: { newUser: any; totalUsers: number; allUsers: any[] }) => {
      matchData.updateUsers(data.allUsers);
    },
    [matchData]
  );

  const handleUserLeft = useCallback(
    (data: { leftUser: string; totalUsers: number; allUsers: any[] }) => {
      matchData.updateUsers(data.allUsers);
    },
    [matchData]
  );

  const handleUserListUpdated = useCallback(
    (data: { users: any[]; totalUsers: number }) => {
      matchData.updateUsers(data.users);
    },
    [matchData]
  );

  const handleScoreUpdated = useCallback(
    (data: any) => {
      if (data.score) {
        matchData.updateScore(
          data.score.runs || 0,
          data.score.wickets || 0,
          data.score.overs || 0
        );
      }
      // Update ball history from updatedMatch
      if (data.updatedMatch) {
        matchData.updateBallHistory(
          data.updatedMatch.ballHistory || [],
          data.updatedMatch.score?.currentOverBalls || []
        );
      }
    },
    [matchData]
  );

  const handleMatchStateUpdate = useCallback(
    (data: any) => {
      matchData.updateMatchData({
        matchCode: data.matchCode,
        createdBy: data.createdBy,
        users: data.users || [],
        settings: data.settings,
        score: data.score,
        isAdmin: data.isAdmin,
        ballHistory: data.ballHistory || [],
        currentOverBalls: data.score?.currentOverBalls || [],
      });
    },
    [matchData]
  );

  // Initialize socket listeners
  useMatchSocket({
    matchId,
    isAdmin: matchData.isAdmin,
    onUserJoined: handleUserJoined,
    onUserLeft: handleUserLeft,
    onUserListUpdated: handleUserListUpdated,
    onScoreUpdated: handleScoreUpdated,
    onMatchStateUpdate: handleMatchStateUpdate,
  });


  // Handle score update
  const handleScoreUpdate = (type: string, runs: number) => {
    setScoreUpdateError(null);
    setUpdatingScore(true);

    const visitorId = localStorage.getItem("visitorId") || "";
    const payload = {
      visitorId,
      event: { type, runs },
    };

    if (!socket || !isConnected) {
      setScoreUpdateError("Not connected to server");
      setUpdatingScore(false);
      return;
    }

    socket.emit("updateMatch", matchId, payload, (response: any) => {
      setUpdatingScore(false);
      if (response.success) {
        matchData.updateScore(
          response.updatedMatch.score.runs || 0,
          response.updatedMatch.score.wickets || 0,
          response.updatedMatch.score.overs || 0
        );
        // Update ball history from response
        matchData.updateBallHistory(
          response.updatedMatch.ballHistory || [],
          response.updatedMatch.score?.currentOverBalls || []
        );
      } else {
        setScoreUpdateError(response.error || "Failed to update score");
      }
    });
  };

  // Handle leave match
  const handleLeaveMatch = () => {
    if (socket && isConnected) {
      socket.emit("leaveMatch");
    }
    router.push("/");
  };

  // Loading state
  if (matchData.loading) {
    return <LoadingState message="Loading match..." />;
  }

  // Error state
  if (matchData.error) {
    return <ErrorState error={matchData.error} />;
  }

  // No match found
  if (!matchData.match) {
    return <ErrorState error="No match found" />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardHeader
        matchCode={matchData.match.matchCode}
        createdBy={matchData.match.createdBy}
        isAdmin={matchData.isAdmin}
        isConnected={isConnected}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Scoreboard */}
          <div className="md:col-span-2">
            <Scoreboard
              score={matchData.score}
              wickets={matchData.wickets}
              overs={matchData.overs}
              isAdmin={matchData.isAdmin}
              loading={updatingScore}
              onScoreUpdate={handleScoreUpdate}
            />

            <MatchInfo
              totalOvers={matchData.match.settings?.overs || 5}
              totalPlayers={matchData.match.settings?.players || 11}
            />

            <BallHistory
              ballHistory={matchData.ballHistory}
              currentOverBalls={matchData.currentOverBalls}
              totalOvers = {matchData.match.settings?.overs || 5}
            />
          </div>

          {/* Right Column: Users Panel */}
          <div className="md:col-span-1">
            <UsersPanel
              users={matchData.users}
              matchCode={matchData.match.matchCode}
              onLeaveMatch={handleLeaveMatch}
              onCopyCode={handleCopy}
              copied={copied}
            />
          </div>
        </div>

        {/* Score update error */}
        {scoreUpdateError && (
          <div className="mt-4 bg-red-900/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
            {scoreUpdateError}
          </div>
        )}
      </div>
    </div>
  );
}
