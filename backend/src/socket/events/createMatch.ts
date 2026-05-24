import { Socket } from "socket.io";
import * as matchService from "../../services/matchService.js";
import devLogger from "../../logger/devLogger.js";
import { CreateMatchData } from "../../services/matchService.js";

export async function handleCreateMatch(
  socket: Socket,
  matchNamespace: any,
  data: CreateMatchData,
  callback?: (response: any) => void
): Promise<void> {
  try {
    if (!data.displayName || data.displayName.trim().length === 0) {
      return callback?.({
        success: false,
        error: "Display name is required",
      });
    }

    const newMatch = await matchService.createMatch(data);
    const roomName = `match-${newMatch.matchCode}`;
    socket.join(roomName);

    socket.data.visitorId = data.visitorId;
    socket.data.matchCode = newMatch.matchCode;
    socket.data.displayName = data.displayName;
    socket.data.role = "admin";

    devLogger.info(`Match created`, {
      matchCode: newMatch.matchCode,
      adminName: data.displayName,
      socketId: socket.id,
    });

    callback?.({
      success: true,
      matchCode: newMatch.matchCode,
      matchId: newMatch._id,
      score: newMatch.score,
    });

    matchNamespace.to(roomName).emit("userListUpdated", {
      users: newMatch.users,
      totalUsers: newMatch.users.length,
    });
  } catch (error) {
    devLogger.error(`Failed to create match`, {
      error: error instanceof Error ? error.message : "Unknown error",
      socketId: socket.id,
      displayName: data.displayName,
      stack: error instanceof Error ? error.stack : undefined,
    });

    callback?.({
      success: false,
      error: "Failed to create match",
    });
  }
}