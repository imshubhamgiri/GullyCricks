import { Request, Response, NextFunction } from "express";
// OPTIMIZED: Dev-only logger - no I/O overhead in production
export default function log(request: Request, response: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === "development") {
    const timestamp = new Date().toISOString();
    let StartTime = Date.now();
    // Use setImmediate to defer logging (non-blocking)
    response.on("finish", () => {
      const duration = Date.now() - StartTime;
      console.log(`[${timestamp}] ${request.method} ${request.originalUrl} - ${response.statusCode} (${duration}ms)`);
    });
  }
  next();
}