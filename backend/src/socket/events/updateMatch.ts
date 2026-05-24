import { Socket } from "socket.io";
import Match from "../../models/Match.js";
import * as matchService from "../../services/matchService.js";
import devLogger from "../../logger/devLogger.js";
import { updateMatchData } from "../../services/matchService.js";

export async function handleUpdateMatch(
  socket: Socket,
  matchNamespace: any,
  matchId: string,
  data: updateMatchData,
  callback?: (response: any) => void
): Promise<void> {
  try {
    if (!matchId) {
      return callback?.({
        success: false,
        error: "Match ID is required",
      });
    }

    const updatedMatch = await matchService.updateMatch(matchId, data);

    const match = await Match.findById(matchId);
    if (!match) {
      return callback?.({
        success: false,
        error: "Match not found",
      });
    }

    const roomName = `match-${match.matchCode}`;

    matchNamespace.to(roomName).emit("updatedScore", {
      updatedMatch,
      score: updatedMatch?.score,
    });

    callback?.({
      success: true,
      message: "Score updated successfully",
      updatedMatch,
    });

    devLogger.info(`Match score updated: ${matchId}`, { socketId: socket.id });
  } catch (error) {
    devLogger.error(`Update match error`, {
      error: error instanceof Error ? error.message : "Unknown error",
      socketId: socket.id,
      stack: error instanceof Error ? error.stack : undefined,
    });

    callback?.({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update score",
    });
  }
}
