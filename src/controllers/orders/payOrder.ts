import { Request, Response } from "express";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import prisma from "../../prisma";

const payOrdersSchema = z.object({
  tableNumber: z.number().int().min(1),
});

export const payOrders = async (req: Request, res: Response) => {
  const emitRefresh = req.app.locals.emitRefresh;
  const parsed = payOrdersSchema.safeParse(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid table number", details: parsed.error.issues });
  }

  const { tableNumber } = parsed.data;

  try {
    // Find the table by number
    const table = await prisma.table.findUnique({
      where: { number: tableNumber },
      include: {
        orders: {
          where: { status: { not: OrderStatus.PAID } },
        },
      },
    });

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    if (table.orders.length === 0) {
      return res
        .status(400)
        .json({ error: "No active orders to pay for this table" });
    }

    // Update all active orders to PAID
    const updatedOrders = await prisma.order.updateMany({
      where: {
        tableId: table.id,
        status: { not: OrderStatus.PAID },
      },
      data: { status: OrderStatus.PAID },
    });

    emitRefresh();

    return res.status(200).json({
      tableNumber,
      paidOrdersCount: updatedOrders.count,
      message: "All active orders for this table have been paid.",
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to pay orders" });
  }
};
