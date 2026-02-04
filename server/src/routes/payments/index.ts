import express from "express";
import { Router } from "express";
import { createPayment } from "../../controllers/payments/createPayment";
import { requireAuth } from "../../middleware/auth";
import { stripeWebhook } from "../../controllers/payments/webhook";

export const paymentsRouter = Router();

paymentsRouter.post("/createPayments", requireAuth, createPayment);
paymentsRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);