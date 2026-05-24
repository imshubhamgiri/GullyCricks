import { Socket } from "socket.io";
import Match from "../../models/Match.js";
import devLogger from "../../logger/devLogger.js";

export async function handleReconnectRoom(
  socket: Socket,
  matchNamespace: any,
  data: { visitorId: string },
  callback?: (response: any) => void
): Promise<void> {
  try {
    const user = await Match.findOne({ "users.visitorId": data.visitorId });

    if (!user) {
      devLogger.warn(`[RECONNECT] No match found for visitorId: ${data.visitorId}`, {
        socketId: socket.id,
      });
      return;
    }

    const matchCode = user.matchCode;
    const roomName = `match-${matchCode}`;
    const displayName =
      user.users.find((u) => u.visitorId === data.visitorId)?.displayName || "Unknown";
    const isAdmin =
      user.users.find((u) => u.visitorId === data.visitorId)?.role === "admin";

    socket.join(roomName);

    socket.data.visitorId = data.visitorId;
    socket.data.matchCode = matchCode;
    socket.data.displayName = displayName;
    socket.data.role = isAdmin ? "admin" : "viewer";

    socket.emit("matchStateUpdate", {
      matchCode: user.matchCode,
      createdBy: user.createdBy,
      users: user.users,
      settings: user.settings,
      score: user.score,
      ballHistory: user.ballHistory || [],
      isAdmin: isAdmin,
      totalUsers: user.users.length,
    });

    socket.to(roomName).emit("userJoined", {
      newUser: {
        visitorId: data.visitorId,
        displayName,
        role: isAdmin ? "admin" : "viewer",
      },
      totalUsers: user.users.length,
      allUsers: user.users,
    });

    devLogger.info(
      `[RECONNECT] ${data.visitorId} reconnected to match ${matchCode}`,
      { socketId: socket.id }
    );
  } catch (error) {
    devLogger.error("[RECONNECT] Reconnect error", {
      error: error instanceof Error ? error.message : "Unknown error",
      socketId: socket.id,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
