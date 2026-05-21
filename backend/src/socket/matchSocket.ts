import { Server, Socket } from "socket.io";
import Match from "../models/Match.js";
import {updateMatch} from "../services/matchService.js";
import { generateMatchCode } from "../utlis/generateMatchCode.js";
import{ CreateMatchData , updateMatchData} from "../services/matchService.js";
import * as matchService from "../services/matchService.js";

/**
 * SOCKET.IO MATCH NAMESPACE HANDLER
 * 
 * This file manages all match-related real-time events:
 * - Creating matches
 * - Joining matches
 * - Leaving matches
 * - User list syncing
 * 
 * Key concepts:
 * - Namespaces: Organize events logically (/matches)
 * - Rooms: Isolate each match (match-ABC123)
 * - Broadcasting: Send to specific room users
 */

//  OPTIMIZED: Dev-only logger to avoid I/O overhead in production
const logger = (message: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[MATCH] ${message}`, data || "");
  }
};

export function setupMatchSocket(io: Server): void {
  // Create namespace for match events (all match logic goes here)
  const matchNamespace = io.of("/matches");

  /**
   * Connection Handler
   * Runs when a user connects to /matches namespace
   */
  matchNamespace.on("connection", (socket: Socket) => {
    logger(`User connected: ${socket.id}`);

    /**
     * EVENT: Create Match
     * 
     * Request from client:
     * socket.emit("createMatch", { adminName: "John Doe" })
     * 
     * What happens:
     * 1. Generate unique match code (ABC123)
     * 2. Create match in MongoDB
     * 3. Add creator as admin
     * 4. Join creator to match room
     * 5. Send back match ID and code to client
     * 
     * Error cases:
     * - Invalid admin name
     * - Database error
     */
    socket.on("createMatch", async (data: CreateMatchData, callback) => {
      try {
        // Validate input
        if (!data.displayName || data.displayName.trim().length === 0) {
          return callback({
            success: false,
            error: "Display name is required",
          });
        }

        // Generate unique match code
        const newMatch = await matchService.createMatch(data);

        // Add socket to match room (so this user only gets updates for THIS match)
        // Room name format: match-ABC123
        const roomName = `match-${newMatch.matchCode}`;
        socket.join(roomName);

        // Store match code in socket so we know which match this user is in
        socket.data.visitorId = data.visitorId;  //  Store visitorId
        socket.data.adminCode = data.visitorId;
        socket.data.matchCode = newMatch.matchCode;
        socket.data.displayName = data.displayName;
        socket.data.role = "admin";

        logger(`Match created: ${newMatch.matchCode} by ${data.displayName}`);

        // Send success response with match details to the creator (including initial score)
        callback({
          success: true,
          matchCode: newMatch.matchCode,
          matchId: newMatch._id,
          score: newMatch.score, //  Include initial score
          message: "Match created successfully",
        });

        // Notify all users in this room about user list update
        // (even though only creator is here, good practice for consistency)
        matchNamespace.to(roomName).emit("userListUpdated", {
          users: newMatch.users,
          totalUsers: newMatch.users.length,
        });
      } catch (error) {
        if (process.env.NODE_ENV === "development") console.error("[MATCH] Create match error:", error);
        callback({
          success: false,
          error: "Failed to create match",
        });
      }
    });

    /**
     * EVENT: Join Match
     * 
     * Request from client:
     * socket.emit("joinMatch", { matchCode: "ABC123", playerName: "Jane" })
     * 
     * What happens:
     * 1. Find match by code
     * 2. Validate match exists and is active
     * 3. Add user to match users list
     * 4. Join socket to match room
     * 5. Notify all users in room about the new joiner
     * 
     * Error cases:
     * - Invalid match code
     * - Match not found
     * - Invalid player name
     */
    socket.on("joinMatch", async (data: {visitorId: string; matchCode: string; playerName: string }, callback) => {
      try {
        // Validate inputs
        if (!data.matchCode || !data.playerName || data.playerName.trim().length === 0) {
          return callback({
            success: false,
            error: "Match code and player name are required",
          });
        }

        // Find match in database
        const match = await Match.findOne({
          matchCode: data.matchCode.toUpperCase(),
        });

        if (!match) {
          return callback({
            success: false,
            error: "Match not found. Check your match code.",
          });
        }

        // Check if user already in this match
        const alreadyInMatch = match.users.some(
          (user) => user.visitorId === data.visitorId
        );

        if (alreadyInMatch) {
          return callback({
            success: false,
            error: "You are already in this match",
          });
        }

        // Add user to match
        match.users.push({
          visitorId: data.visitorId,
          displayName: data.playerName,
          role: "viewer", // New joiners are viewers, not admins
        });

        await match.save();

        // Join socket to match room
        const roomName = `match-${data.matchCode.toUpperCase()}`;
        socket.join(roomName);

        // Store match info in socket
        socket.data.visitorId = data.visitorId;  //  Store visitorId
        socket.data.matchCode = data.matchCode.toUpperCase();
        socket.data.displayName = data.playerName;
        socket.data.role = "viewer";

        logger(`${data.playerName} joined match: ${data.matchCode}`);

        // Send success response with full match data INCLUDING current score
        callback({
          success: true,
          matchId: match._id,
          match: {
            matchCode: match.matchCode,
            createdBy: match.createdBy,
            users: match.users,
            settings: match.settings,
            score: match.score // Include current score so joining user sees it
          },
        });

        // Notify ALL users in this room that someone joined (includes admin)
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
        if (process.env.NODE_ENV === "development") console.error("[MATCH] Join match error:", error);
        callback({
          success: false,
          error: "Failed to join match",
        });
      }
    });


    //MatchUpdate socket
    socket.on("updateMatch", async (matchId: string, data: updateMatchData, callback) => {
      try {
        
        //  AWAIT the async function
        const updatedMatch = await updateMatch(matchId, data);
        
        // Get the match code for room name
        const match = await Match.findById(matchId);
        if (!match) {
          callback({
            success: false,
            error: "Match not found"
          });
          return;
        }
        
        const roomName = `match-${match.matchCode}`;
        
        //  Emit to all users in the match room
        matchNamespace.to(roomName).emit("updatedScore", {
          updatedMatch,
          score: updatedMatch?.score  // Extract score for easier access
        });
        
        //  Send callback to acknowledge the update
        callback({
          success: true,
          message: "Score updated successfully",
          updatedMatch
        });
        
        logger(`Match score updated: ${matchId}`);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[MATCH] Update match error:", error);
        }
        callback({
          success: false,
          error: error instanceof Error ? error.message : "Failed to update score"
        });
      }
    })
    /**
     * EVENT: Leave Match
     * 
     * What happens:
     * 1. Remove user from match users list
     * 2. Leave socket from match room
     * 3. Notify others in room
     * 4. Delete match if no users left (cleanup)
     */
    socket.on("leaveMatch", async () => {
      try {
        const matchCode = socket.data.matchCode;
        const visitorId = socket.data.visitorId;  //  Add this
        const displayName = socket.data.displayName;

        if (!matchCode || !visitorId) {
          logger("User tried to leave without proper match data");
          return;
        }

        const match = await Match.findOne({ matchCode });
        if (match) {
          match.users.pull({ visitorId: visitorId });  //  Use visitorId
          
          if (match.users.length === 0) {
            await Match.deleteOne({ matchCode });
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
        console.log(`${displayName} left match: ${matchCode}`);
      } catch (error) {
        console.error("[MATCH] Leave match error:", error);
      }
    });

    /**
     * EVENT: Disconnect
     * 
     * Runs when user closes browser or loses connection
     * Automatically cleans up their match
     */
   socket.on("reconnectRoom", async ({ visitorId }) => {
  const user = await Match.findOne({ "users.visitorId": visitorId });
  if (user) {
    const matchCode = user.matchCode;
    const roomName = `match-${matchCode}`;
    const displayName = user.users.find((u) => u.visitorId === visitorId)?.displayName || "Unknown";
    const isAdmin = user.users.find((u) => u.visitorId === visitorId)?.role === "admin";
    socket.join(roomName);
    socket.data.visitorId = visitorId;
    socket.data.matchCode = matchCode;
    socket.data.displayName = displayName;
    socket.data.isAdmin = isAdmin;
    
    //  Send current match state back to the reconnected user
    socket.emit("matchStateUpdate", {
      matchCode: user.matchCode,
      createdBy: user.createdBy,
      users: user.users,
      settings: user.settings,
      score: user.score,  //  Send current score
      isAdmin: isAdmin,
      totalUsers: user.users.length,
    });
    
    //  Notify other users that someone reconnected
    socket.to(roomName).emit("userJoined", {
      newUser: {
        visitorId,
        displayName,
        role: user.users.find((u) => u.visitorId === visitorId)?.role || "viewer",
      },
      totalUsers: user.users.length,
      allUsers: user.users,
    });
    
    console.log(`[RECONNECT] ${visitorId} reconnected to match ${matchCode}`);
  } else {
    console.log(`[RECONNECT] User ${visitorId} not found in any match`);
  }
});

    socket.on("disconnect", async () => {
      try {
        const matchCode = socket.data.matchCode;
        const displayName = socket.data.displayName;

        //  DON'T remove user from match on disconnect
        // This allows them to rejoin on reconnect (page refresh, network hiccup)
        // Users are only removed on explicit leaveMatch or after a timeout
        
        logger(`User disconnected: ${socket.id} (${displayName})`);
      } catch (error) {
        if (process.env.NODE_ENV === "development") console.error("[MATCH] Disconnect error:", error);
      }
    });
  });

  logger("Match namespace initialized (/matches)");
}
