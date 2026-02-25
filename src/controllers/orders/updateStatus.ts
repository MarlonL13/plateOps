import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../../prisma";

const updateStatusSchema = z.object({
  orderId: z.uuid(),
});

export const updateOrderStatus = async (req: Request, res: Response) => {
  const emitRefresh = req.app.locals.emitRefresh;
  const parsed = updateStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid orderId", details: parsed.error.issues });
  }

  const { orderId } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

      let newStatus: string;
    if (order.status === "PENDING") {
      newStatus = "IN_PROGRESS";
    } else if (order.status === "IN_PROGRESS") {
      newStatus = "READY";
    } else {
      return res.status(400).json({ error: "Order status cannot be updated further" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    emitRefresh();

    return res.status(200).json({
      id: updatedOrder.id,
      status: updatedOrder.status,
      updatedAt: updatedOrder.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update order status" });
  }
};