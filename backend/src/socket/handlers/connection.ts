import { Socket } from "socket.io";
import devLogger from "../../logger/devLogger.js";

export function handleConnection(socket: Socket): void {
  devLogger.info(`User connected`, { socketId: socket.id });
}
