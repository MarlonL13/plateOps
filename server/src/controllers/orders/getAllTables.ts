import { Request, Response } from "express";
import {  OrderStatus } from "@prisma/client";
import prisma from "../../prisma";

export const getAllTables = async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      include: {
        orders: {
          where: {
            status: {
              in: [OrderStatus.PENDING, OrderStatus.IN_PROGRESS, OrderStatus.READY],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        number: "asc",
      },
    });

    const result = tables.map((table) => {
      const activeOrder = table.orders[0];
      return {
        id: table.id,
        number: table.number,
        status: table.status,
        activeOrder: activeOrder
          ? {
              id: activeOrder.id,
              status: activeOrder.status,
              notes: activeOrder.notes,
              createdAt: activeOrder.createdAt,
              updatedAt: activeOrder.updatedAt,
            }
          : "Nenhum pedido ativo",
      };
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch tables" });
  }
};