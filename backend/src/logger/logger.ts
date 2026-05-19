import { Request, Response, NextFunction } from "express";

// ✅ OPTIMIZED: Dev-only logger - no I/O overhead in production
export default function log(request: Request, response: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === "development") {
    const timestamp = new Date().toISOString();
    // Use setImmediate to defer logging (non-blocking)
    setImmediate(() => {
      console.log(`[${timestamp}] ${request.method} ${request.url}`);
    });
  }
  next();
}