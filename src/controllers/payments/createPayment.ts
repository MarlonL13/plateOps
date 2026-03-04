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
      amount: Math.round(amount * 100), // convert to cents
      currency,
      // You must enable PIX in your Stripe Dashboard. 
      // If it is disabled, providing ['card', 'pix'] will throw an error. 
      // We will default to just 'card' for now so it doesn't crash your backend testing.
      payment_method_types: ['card'], 
      metadata: { tableNumber: String(tableNumber) },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Stripe createPayment error:", error);
    return res.status(500).json({ error: "Failed to create payment intent", details: error instanceof Error ? error.message : String(error) });
  }
};