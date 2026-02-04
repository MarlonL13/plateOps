import { Request, Response } from "express";
import Stripe from "stripe";
import { payOrders } from "../orders/payOrder";

const stripe = new Stripe(process.env.STRIPE_KEY_TESTE as string,);

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      endpointSecret as string
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const tableNumber = paymentIntent.metadata.tableNumber;

    if (tableNumber) {
      // Call your payOrders logic to mark orders as paid
      // Mock a request/response for payOrders
      const mockReq = {
        body: { tableNumber: Number(tableNumber) },
        app: req.app,
      } as Request;
      const mockRes = {
        status: () => ({
          json: () => {},
        }),
      } as unknown as Response;

      await payOrders(mockReq, mockRes);
    }
  }

  res.status(200).json({ received: true });
};