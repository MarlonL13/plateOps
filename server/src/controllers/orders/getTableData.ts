import { Request, Response } from "express";
import prisma from "../../prisma";
import { z } from "zod";

const getTableDataSchema = z.object({
  tableNumber: z.number().int().min(1),
});

export const getTableData = async (req: Request, res: Response) => {
  const parsed = getTableDataSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid table number", details: parsed.error.issues });
  }
  const { tableNumber } = parsed.data;

  try {
    const table = await prisma.table.findUnique({
      where: { number: tableNumber },
      include: {
        orders: {
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    const orders = table.orders.map((order) => {
      const items = order.items.map((item) => ({
        id: item.id,
        name: item.menuItem?.name ?? null,
        price: item.menuItem ? Number(item.menuItem.price) : null,
        quantity: item.quantity,
        total: item.menuItem ? Number(item.menuItem.price) * item.quantity : 0,
      }));

      const orderTotal = items.reduce((sum, item) => sum + item.total, 0);

      return {
        orderId: order.id,
        status: order.status,
        createdAt: order.createdAt,
        items,
        orderTotal,
      };
    });

    const tableTotal = orders.reduce((sum, order) => sum + order.orderTotal, 0);

    return res.status(200).json({
      tableNumber: table.number,
      orders,
      tableTotal,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch table data" });
  }
};
