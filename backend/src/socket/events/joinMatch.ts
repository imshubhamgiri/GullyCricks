import { Socket } from "socket.io";
import Match from "../../models/Match.js";
import devLogger from "../../logger/devLogger.js";

export async function handleJoinMatch(
  socket: Socket,
  matchNamespace: any,
  data: any,
  callback?: (response: any) => void
): Promise<void> {
  try {
    if (!data.matchCode || !data.playerName?.trim()) {
      devLogger.warn(`Invalid join attempt`, {
        socketId: socket.id,
        reason: "Missing matchCode or playerName",
      });
      return callback?.({
        success: false,
        error: "Match code and player name are required",
      });
    }

    const match = await Match.findOne({
      matchCode: data.matchCode.toUpperCase(),
    });

    if (!match) {
      devLogger.warn(`Match not found`, {
        socketId: socket.id,
        matchCode: data.matchCode,
        playerName: data.playerName,
      });
      return callback?.({
        success: false,
        error: "Match not found. Check your match code.",
      });
    }

    const alreadyInMatch = match.users.some(
      (user) => user.visitorId === data.visitorId
    );

    if (alreadyInMatch) {
      devLogger.warn(`Duplicate join attempt`, {
        socketId: socket.id,
        matchCode: data.matchCode,
        visitorId: data.visitorId,
      });
      return callback?.({
        success: false,
        error: "You are already in this match",
      });
    }

    match.users.push({
      visitorId: data.visitorId,
      displayName: data.playerName,
      role: "viewer",
    });

    await match.save();

    const roomName = `match-${data.matchCode.toUpperCase()}`;
    socket.join(roomName);

    socket.data.visitorId = data.visitorId;
    socket.data.matchCode = data.matchCode.toUpperCase();
    socket.data.displayName = data.playerName;
    socket.data.role = "viewer";

    devLogger.info(`Player joined match`, {
      socketId: socket.id,
      matchCode: data.matchCode,
      playerName: data.playerName,
      totalUsers: match.users.length,
    });

    callback?.({
      success: true,
      matchId: match._id,
      match: {
        matchCode: match.matchCode,
        createdBy: match.createdBy,
        users: match.users,
        settings: match.settings,
        score: match.score,
      },
    });

    matchNamespace.to(roomName).emit("userJoined", {
      newUser: {
        visitorId: data.visitorId,
        displayName: data.playerName,
        role: "viewer",
      },
      totalUsers: match.users.length,
      allUsers: match.users,
    });
  } catch (error) {
    devLogger.error(`Failed to join match`, {
      error: error instanceof Error ? error.message : "Unknown error",
      socketId: socket.id,
      matchCode: data.matchCode,
      stack: error instanceof Error ? error.stack : undefined,
    });

    callback?.({
      success: false,
      error: "Failed to join match",
    });
  }
}
