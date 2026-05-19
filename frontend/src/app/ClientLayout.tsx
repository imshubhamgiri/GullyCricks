"use client";

import { SocketProvider } from "@/context/SocketContext";

/**
 * Client-side layout wrapper
 * Provides Socket.io context to all pages
 */
export function ClientLayout({ children }: { children: React.ReactNode }) {
  return <SocketProvider>{children}</SocketProvider>;
}
