import { Socket } from "socket.io";
import devLogger from "../../logger/devLogger.js";

export function handleDisconnect(socket: Socket): void {
  try {
    const displayName = socket.data.displayName || "Unknown";
    devLogger.info(`User disconnected`, {
      socketId: socket.id,
      displayName,
    });
    // DON'T remove user from match on disconnect
    // This allows them to rejoin on reconnect (page refresh, network hiccup)
  } catch (error) {
    devLogger.error("Disconnect error", {
      error: error instanceof Error ? error.message : "Unknown error",
      socketId: socket.id,
    });
  }
}
