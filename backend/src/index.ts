import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupMatchSocket } from "./socket/matchSocket.js";
import devLogger from "./logger/devLogger.js";

const PORT = Number(process.env.PORT) || 5000;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
const MONGO_URI = process.env.MONGO_URI;

// OPTIMIZED: Dev-only logger
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

  setupMatchSocket(io);

  io.on("connection", (socket) => {
    devLogger.info(`User connected to default namespace`, { socketId: socket.id });
    socket.on("disconnect", () => {
      devLogger.info(`User disconnected from default namespace`, { socketId: socket.id });
    });
  });

  server.listen(PORT, HOST(), () => {
    devLogger.info(`Server started`, { port: PORT, host: HOST(), env: process.env.NODE_ENV });
  });

  process.on("SIGINT", async () => {
    devLogger.info(`Graceful shutdown initiated`);
    server.closeAllConnections();
    server.close(async () => {
      devLogger.info(`Server closed`);
      try {
        await mongoose.connection.close();
        devLogger.info(`MongoDB disconnected`);
        process.exit(0);
      } catch (error) {
        devLogger.error(`Failed to close MongoDB`, {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        process.exit(1);
      }
    });

    setTimeout(() => {
      devLogger.error(`Graceful shutdown timeout - forcing exit`);
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
