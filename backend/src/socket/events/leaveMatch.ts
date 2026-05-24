import { Socket } from "socket.io";
import Match from "../../models/Match.js";
import devLogger from "../../logger/devLogger.js";

export async function handleLeaveMatch(
  socket: Socket,
  matchNamespace: any,
  data?: any,
  callback?: (response: any) => void
): Promise<void> {
  try {
    const matchCode = socket.data.matchCode;
    const visitorId = socket.data.visitorId;
    const displayName = socket.data.displayName;

    if (!matchCode || !visitorId) {
      devLogger.warn("User tried to leave without proper match data", {
        socketId: socket.id,
        matchCode,
        visitorId,
        displayName,
      });
      return;
    }
    console.log("leave initiated by", visitorId)
    const match = await Match.findOneAndUpdate(
      { matchCode },
      { $pull: { users: { visitorId: visitorId } } },
      { returnDocument: "after" }
    );
    if (match) {
      //  match.users.pull({ visitorId: visitorId }); // didn't work, so using findOneAndUpdate with $pull instead
      console.log(match.users.length)
      if (match && match.users.length === 0) {
        await Match.deleteOne({ matchCode });
        devLogger.info(`Match deleted (no users): ${matchCode}`, { socketId: socket.id });
      } else {
        await match.save();  
        const roomName = `match-${matchCode}`;
        matchNamespace.to(roomName).emit("userLeft", {
          leftUser: displayName,
          totalUsers: match.users.length,
          allUsers: match.users,
        });
      }
    }

    socket.leave(`match-${matchCode}`);
    devLogger.info(`${displayName} left match: ${matchCode}`, { socketId: socket.id });
  } catch (error) {
    devLogger.error("Leave match error", {
      error: error instanceof Error ? error.message : "Unknown error",
      socketId: socket.id,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
