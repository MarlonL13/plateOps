import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);

  return app;
};
