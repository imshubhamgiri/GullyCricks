import { Request, Response, NextFunction } from "express";

export default function log(request: Request, response: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${request.method} ${request.url}`);
  next();
}