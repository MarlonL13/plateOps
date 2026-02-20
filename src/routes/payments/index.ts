import { Router } from "express";
import express from "express";
import { createPayment } from "../../controllers/payments/createPayment";
import { processCashPayment } from "../../controllers/payments/cashPayments";
import { stripeWebhook } from "../../controllers/payments/webhook";

const paymentsRouter = Router();

// Credit Card Payment Intent
paymentsRouter.post("/create-payment", createPayment);

// Cash Payment
paymentsRouter.post("/cash", processCashPayment);

export { paymentsRouter };