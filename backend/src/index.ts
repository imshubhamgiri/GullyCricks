import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupMatchSocket } from "./socket/matchSocket.js";

const PORT = Number(process.env.PORT) || 5000;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
const MONGO_URI = process.env.MONGO_URI;

// ✅ OPTIMIZED: Dev-only logger
const logger = (message: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[SERVER] ${message}`, data || "");
  }
};

const HOST = (): string => {
  if (process.env.NODE_ENV === "production") {
    return "0.0.0.0";
  }
  return "localhost";
};

async function startServer(): Promise<void> {
  await connectDB(MONGO_URI);

  // Setup match socket handlers (namespace: /matches)
  setupMatchSocket(io);

  // Default namespace connection (optional - for general events)
  io.on("connection", (socket) => {
    logger(`User connected: ${socket.id}`);
    socket.on("disconnect", () => {
      logger(`User disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, HOST(), () => {
    logger(`Server is running on port ${PORT}`);
  });

  process.on("SIGINT", async () => {
    logger("SIGINT received, shutting down gracefully...");
    
    // Close all active connections immediately
    server.closeAllConnections();
    
    // Close the server
    server.close(async () => {
      logger("Server closed.");
      
      try {
        await mongoose.connection.close();
        logger("MongoDB connection closed.");
        process.exit(0);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Error closing MongoDB:", message);
        process.exit(1);
      }
    });
    
    // Force exit after 10 seconds if still running
    setTimeout(() => {
      console.error("\nForce exit - graceful shutdown timeout");
      process.exit(1);
    }, 10000);
  });
}

process.on("unhandledRejection",(reason) => {
  console.error("Unhandled Rejection at:", reason);
  process.exit(1);
});

process.on("uncaughtException",(error) => {
  const message = error instanceof Error ? error.message : "Unknown uncaught exception";
  console.error("Uncaught Exception:", message);
  process.exit(1);
});

void startServer();
