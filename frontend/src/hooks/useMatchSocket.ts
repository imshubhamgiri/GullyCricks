import { useEffect, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import type { User } from "./useMatchData";

interface UseMatchSocketProps {
  matchId: string;
  isAdmin: boolean;
  onUserJoined: (data: { newUser: User; totalUsers: number; allUsers: User[] }) => void;
  onUserLeft: (data: { leftUser: string; totalUsers: number; allUsers: User[] }) => void;
  onUserListUpdated: (data: { users: User[]; totalUsers: number }) => void;
  onScoreUpdated: (data: any) => void;
  onMatchStateUpdate: (data: any) => void;
}

export const useMatchSocket = ({
  matchId,
  isAdmin,
  onUserJoined,
  onUserLeft,
  onUserListUpdated,
  onScoreUpdated,
  onMatchStateUpdate,
}: UseMatchSocketProps) => {
  const { socket, isConnected } = useSocket();

  const handleUserJoined = useCallback(onUserJoined, []);
  const handleUserLeft = useCallback(onUserLeft, []);
  const handleUserListUpdated = useCallback(onUserListUpdated, []);
  const handleScoreUpdated = useCallback(onScoreUpdated, []);
  const handleMatchStateUpdate = useCallback(onMatchStateUpdate, []);

  useEffect(() => {
    if (!socket || !isConnected || !matchId) return;

    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handleUserLeft);
    socket.on("userListUpdated", handleUserListUpdated);
    socket.on("updatedScore", handleScoreUpdated);
    socket.on("matchStateUpdate", handleMatchStateUpdate);

    return () => {
      socket.off("userJoined", handleUserJoined);
      socket.off("userLeft", handleUserLeft);
      socket.off("userListUpdated", handleUserListUpdated);
      socket.off("updatedScore", handleScoreUpdated);
      socket.off("matchStateUpdate", handleMatchStateUpdate);
    };
  }, [
    socket,
    isConnected,
    matchId,
    handleUserJoined,
    handleUserLeft,
    handleUserListUpdated,
    handleScoreUpdated,
    handleMatchStateUpdate,
  ]);

  const emitLeaveMatch = useCallback(() => {
    if (socket && isConnected) {
      socket.emit("leaveMatch");
    }
  }, [socket, isConnected]);

  const emitScoreUpdate = useCallback(
    (type: string, runs: number, callback?: (response: any) => void) => {
      if (!socket || !isConnected) {
        return;
      }

      const visitorId = localStorage.getItem("visitorId") || "";
      const payload = {
        visitorId,
        event: { type, runs },
      };

      socket.emit("updateMatch", matchId, payload, (response: any) => {
        if (callback) {
          callback(response);
        }
      });
    },
    [socket, isConnected, matchId]
  );

  return {
    isConnected,
    emitLeaveMatch,
    emitScoreUpdate,
  };
};
