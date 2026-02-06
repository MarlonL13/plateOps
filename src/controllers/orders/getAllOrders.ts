import { Request, Response } from "express";
import prisma from "../../prisma";

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        table: {
          select: {
            number: true,
          },
        },
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    const grouped: Record<string, any[]> = {};
    orders.forEach(order => {
      const status = order.status;
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push({
        id: order.id,
        table: {
          number: order.table?.number ?? null,
        },
        items: order.items.map(item => ({
          id: item.id,
          name: item.menuItem ? item.menuItem.name : null,
          quantity: item.quantity,
        })),
        createdAt: order.createdAt,
      });
    });

    return res.status(200).json(grouped);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};