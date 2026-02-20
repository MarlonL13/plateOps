import { Request, Response } from "express";
import { z } from "zod";
import { payOrders } from "../orders/payOrder";

const cashPaymentSchema = z.object({
  tableNumber: z.number().int().min(1),
});

export const processCashPayment = async (req: Request, res: Response) => {
  const parsed = cashPaymentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
  }

  try {
    // Process the cash payment by marking the table's orders as paid
    await payOrders(req, res);
  } catch (error) {
    return res.status(500).json({ error: "Failed to process cash payment" });
  }
};