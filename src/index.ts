import http from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { registerSocket } from "./socket";

const app = createApp();
const server = http.createServer(app);

const { emitRefresh } = registerSocket(server);
app.locals.emitRefresh = emitRefresh;

server.listen(env.port, () => {
  console.log(`PlateOps API running on port ${env.port}`);
});
