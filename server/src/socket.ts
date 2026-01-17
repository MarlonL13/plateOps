import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "./config/env";

export const registerSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: env.clientOrigin,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      // Placeholder for disconnect logic
    });
  });

  return io;
};
