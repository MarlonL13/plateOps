import { Request, Response } from "express";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

import prisma from "../../prisma";

const createOrderSchema = z.object({
  tableId: z.uuid(),
  waiterId: z.uuid(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.uuid(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

export const createOrder = async (req: Request, res: Response) => {
  const emitRefresh = req.app.locals.emitRefresh;
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid order data", details: parsed.error.issues });
  }
  const { tableId, waiterId, items, notes } = parsed.data;

  try {
    const order = await prisma.order.create({
      data: {
        tableId,
        waiterId,
        notes,
        status: OrderStatus.PENDING,
        items: {
          create: items.map((item: { menuItemId: string; quantity: number }) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity || 1,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
        waiter: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    emitRefresh();

    return res.status(201).json({
      id: order.id,
      table: {
        id: order.table.id,
        number: order.table.number,
      },
      waiter: order.waiter,
      status: order.status,
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.id,
        menuItem: item.menuItem
          ? {
              id: item.menuItem.id,
              name: item.menuItem.name,
              price: item.menuItem.price,
            }
          : null,
        quantity: item.quantity,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create order" });
  }
};