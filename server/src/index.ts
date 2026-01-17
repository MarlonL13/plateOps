import http from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { registerSocket } from "./socket";

const app = createApp();
const server = http.createServer(app);

registerSocket(server);

server.listen(env.port, () => {
  console.log(`PlateOps API running on port ${env.port}`);
});
