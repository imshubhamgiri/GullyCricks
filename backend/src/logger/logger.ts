import { Request } from "express";

export default async function log(request: Request): Promise<void> {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${request.method} ${request.url}`);
}