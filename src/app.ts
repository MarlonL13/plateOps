import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { healthRouter } from "./routes/health";
import morgan from "morgan";
import { authRouter } from "./routes/auth/auth";
import { ordersRouter } from "./routes/orders/index";
import { itensRouter } from "./routes/itens";
import { paymentsRouter } from "./routes/payments";
import { stripeWebhook } from "./controllers/payments/webhook";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );

  // Register Stripe webhook route with raw body parser BEFORE express.json()
  app.post(
    "/api/payments/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhook
  );

  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/itens", itensRouter);
  app.use("/api/payments", paymentsRouter);

  return app;
};
