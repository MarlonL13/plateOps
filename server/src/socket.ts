import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "./config/env";

export const registerSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin:"*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", (reason) => {
      console.log(`Socket ${socket.id} disconnected: ${reason}`);
    });
  });

  // Function to emit refresh event to all clients
  const emitRefresh = () => {
    io.emit("refresh");
  };

  return { io, emitRefresh };
};
