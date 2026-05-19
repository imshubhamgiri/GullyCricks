import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { io, Socket } from "socket.io-client";

/**
 * SOCKET.IO CONTEXT (OPTIMIZED)
 *
 * Creates ONE persistent Socket.io connection for the entire app
 * Survives page navigations, reconnections, etc.
 *
 * Performance optimizations:
 * - Context value memoized (prevents unnecessary re-renders)
 * - Console.logs only in development
 * - Single socket instance across all pages
 * - Proper error handling without extra logging
 */

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Dev-only logger to avoid performance hits
const logger = (message: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[SOCKET] ${message}`, data || "");
  }
};

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only connect on client side (not during SSR)
    if (typeof window === "undefined") return;

    try {
      // Connect to /matches namespace
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      logger("Connecting to:", BACKEND_URL);

      const newSocket = io(`${BACKEND_URL}/matches`, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ["websocket", "polling"],
      });

      // ✅ OPTIMIZED: Hard timeout - after 5 seconds, don't wait for connection
      const connectionTimeout = setTimeout(() => {
        if (!newSocket.connected) {
          logger("Connection timeout - proceeding without socket");
          // Don't force disconnect, let it retry in background
          // This prevents page from hanging indefinitely
        }
      }, 5000);

      // Connection event
      newSocket.on("connect", () => {
        clearTimeout(connectionTimeout);
        logger("✅ Connected", newSocket.id);
        setIsConnected(true);
        setError(null);
      });

      // Disconnection event
      newSocket.on("disconnect", (reason) => {
        logger("🔌 Disconnected", reason);
        setIsConnected(false);
      });

      // Reconnection attempt
      newSocket.on("connect_attempt", () => {
        logger("🔄 Attempting to reconnect...");
      });

      // Reconnection success
      newSocket.on("reconnect", () => {
        logger("✅ Reconnected successfully!");
        setIsConnected(true);
        setError(null);
      });

      // Connection error
      newSocket.on("connect_error", (err: any) => {
        const errMsg = err?.message || "Unknown connection error";
        setError(errMsg);
        setIsConnected(false);
      });

      // Error event
      newSocket.on("error", (err: any) => {
        setError(typeof err === "string" ? err : "Socket error");
      });

      setSocket(newSocket);

      // Cleanup: Only disconnect on app unmount (not on page change)
      return () => {
        clearTimeout(connectionTimeout);
        // Don't disconnect here! We want to persist across pages
        // Only cleanup listeners if needed
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      logger("Setup error:", errorMsg);
    }
  }, []); // Empty dependency array = only run once on app mount

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({ socket, isConnected, error }),
    [socket, isConnected, error]
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Custom hook to use Socket context
 * 
 * Usage:
 * const { socket, isConnected } = useSocket();
 * 
 * if (isConnected) {
 *   socket?.emit("createMatch", { adminName: "John" }, (res) => { ... });
 * }
 */
export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
}
