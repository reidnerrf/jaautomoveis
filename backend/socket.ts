import type { Server as IOServer } from "socket.io";

let ioInstance: IOServer | null = null;

export const setSocketServer = (io: IOServer) => {
  ioInstance = io;
};

export const getSocketServer = (): IOServer | null => ioInstance;
