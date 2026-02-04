import { Request, Response } from "express";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_KEY_TESTE as string);

const createPaymentSchema = z.object({
  amount: z.number().min(1),
  currency: z.string().default("usd"),
  tableNumber: z.number().int().min(1),
});

export const createPayment = async (req: Request, res: Response) => {
  const parsed = createPaymentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payment data", details: parsed.error.issues });
  }

  const { amount, currency, tableNumber } = parsed.data;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: { tableNumber: String(tableNumber) },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create payment intent" });
  }
};