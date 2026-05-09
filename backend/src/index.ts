import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI = process.env.MONGO_URI;

async function startServer(): Promise<void> {
  try {
    await connectDB(MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(`API base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown startup error";
    console.error("Failed to start server:", message);
    process.exit(1);
  }
}

void startServer();
