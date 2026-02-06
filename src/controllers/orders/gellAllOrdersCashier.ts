import { Request, Response } from "express";
import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const getAllOrdersCashier = async (req: Request, res: Response) => {
  try {
    // Get all tables
    const tables = await prisma.table.findMany({
      include: {
        orders: {
          where: {
            // Only active orders (not PAID)
            status: {
              not: "PAID",
            },
          },
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
      orderBy: { number: "asc" },
    });

    const result = tables.map((table) => {
      if (table.orders.length === 0) {
        return {
          tableNumber: table.number,
          status: "EMPTY",
          itemCount: 0,
          totalValue: 0,
        };
      }

      // Flatten all items from all orders for this table
      const allItems = table.orders.flatMap((order) => order.items);

      // Calculate total value and item count
      const totalValue = allItems.reduce((sum, item) => {
        if (item.menuItem) {
          return sum + Number(item.menuItem.price) * item.quantity;
        }
        return sum;
      }, 0);

      const itemCount = allItems.reduce((sum, item) => sum + item.quantity, 0);

      // Get the most recent status among the table's orders
      const status = table.orders.map((order) => order.status);
      // You can choose how to display status: here, we show all status as an array
      // Or pick the "most advanced" status, or the latest order's status
      // For now, let's show all status
      return {
        tableNumber: table.number,
        status,
        itemCount,
        totalValue,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch cashier orders" });
  }
};
