import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";

const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI = process.env.MONGO_URI;
const HOST = (): string => {
  if (process.env.NODE_ENV === "production") {
    return "0.0.0.0";
  }
  return "localhost";
};

async function startServer(): Promise<void> {
  await connectDB(MONGO_URI);
  const server = app.listen(PORT, HOST(), () => {
    console.log(`Server is running on port ${PORT} `);
  });

  process.on("SIGINT", async () => {
    console.log("\nSIGINT received, shutting down gracefully...");
    
    // Close all active connections immediately
    server.closeAllConnections();
    
    // Close the server
    server.close(async () => {
      console.log("Server closed.");
      
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
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
