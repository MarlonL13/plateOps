import { Request, Response } from "express";
import prisma from "../../prisma";

export const getAllItens = async (req: Request, res: Response) => {
  try {
    const items = await prisma.menuItem.findMany();
    const grouped: Record<string, any[]> = {};
    items.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push({
        id: item.id,
        name: item.name,
        price: item.price,
      });
    });

    return res.status(200).json(grouped);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch items" });
  }
};