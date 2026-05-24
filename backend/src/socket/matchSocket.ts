import { Server, Socket } from "socket.io";
// import socketRouter from "./router.js";
import { handleConnection } from "./handlers/connection.js";
import { handleDisconnect } from "./handlers/disconnect.js";
import { handleCreateMatch } from "./events/createMatch.js";
import { handleJoinMatch } from "./events/joinMatch.js";
import { handleUpdateMatch } from "./events/updateMatch.js";
import { handleLeaveMatch } from "./events/leaveMatch.js";
import { handleReconnectRoom } from "./events/reconnectRoom.js";

/**
 * SOCKET.IO MATCH NAMESPACE SETUP
 * 
 * This file acts as the orchestrator for all socket events.
 * Event logic lives in events/ folder (similar to Express routes)
 * 
 * Key concepts:
 * - Namespaces: Organize events logically (/matches)
 * - Rooms: Isolate each match (match-ABC123)
 * - Broadcasting: Send to specific room users
 */

export function setupMatchSocket(io: Server): void {
  const matchNamespace = io.of("/matches");

  matchNamespace.on("connection", (socket: Socket) => {
    handleConnection(socket);


    // Manually register createMatch for now to ensure it's working before we add more events
    socket.on("createMatch", (data, callback) => handleCreateMatch(socket, matchNamespace, data, callback));
    socket.on("joinMatch", (data, callback) => handleJoinMatch(socket, matchNamespace, data, callback));
    socket.on("updateMatch", (matchId, data, callback) => handleUpdateMatch(socket, matchNamespace, matchId, data, callback));
    socket.on("leaveMatch", (data, callback) => handleLeaveMatch(socket, matchNamespace, data, callback));
    socket.on("reconnectRoom", (data, callback) => handleReconnectRoom(socket, matchNamespace, data, callback));

    // Handle disconnect
    socket.on("disconnect", () => {
      handleDisconnect(socket);
    });
  });
}
