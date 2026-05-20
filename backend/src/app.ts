import express from "express";
import path from "path";
import cors from "cors";
import routes from "./routes/index.js";
import logger from "./logger/logger.js";
import { Request, Response, NextFunction } from "express";

const app = express();

app.use(cors());
app.use(logger);
// app.set("view engine", "ejs");
// app.set("views", path.join(process.cwd(), "src", "views"));

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// ✅ OPTIMIZED: Return JSON instead of rendering EJS (saves 14-18s!)
app.get("/", (_req, res) => {
  res.json({ 
    service: "GullyCricks API",
    status: "running",
    version: "1.0.0"
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);

app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
