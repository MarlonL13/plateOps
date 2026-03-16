import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../../prisma";

const insightsQuerySchema = z.object({
  range: z.enum(["today", "7d", "30d"]).optional(),
});

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pedido Feito",
  IN_PROGRESS: "Em Preparo",
  READY: "Pronto",
  PAID: "Pago",
};

const getRangeStart = (range: "today" | "7d" | "30d") => {
  const now = new Date();
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  const days = range === "7d" ? 7 : 30;
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date;
};

const getOrderTotal = (items: Array<{ quantity: number; menuItem: { price: unknown } | null }>) => {
  return items.reduce((sum, item) => {
    if (!item.menuItem) {
      return sum;
    }
    return sum + Number(item.menuItem.price) * item.quantity;
  }, 0);
};

export const getOrdersInsights = async (req: Request, res: Response) => {
  const parsed = insightsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid query params", details: parsed.error.issues });
  }

  const range = parsed.data.range ?? "today";
  const fromDate = getRangeStart(range);

  try {
    const [ordersInRange, activeOrders, allTables] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: fromDate,
          },
        },
        include: {
          table: {
            select: {
              number: true,
            },
          },
          waiter: {
            select: {
              id: true,
              username: true,
            },
          },
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      }),
      prisma.order.findMany({
        where: {
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
      }),
      prisma.table.findMany({
        include: {
          orders: {
            where: {
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
        orderBy: {
          number: "asc",
        },
      }),
    ]);

    const paidOrdersInRange = ordersInRange.filter((order) => order.status === "PAID");
    const readyOrdersInRange = ordersInRange.filter((order) => order.status === "READY");

    const revenue = paidOrdersInRange.reduce(
      (sum, order) => sum + getOrderTotal(order.items),
      0,
    );

    const avgPrepMinutesBase = ordersInRange.filter((order) =>
      ["IN_PROGRESS", "READY", "PAID"].includes(order.status),
    );
    const avgPrepMinutes =
      avgPrepMinutesBase.length === 0
        ? 0
        : Math.round(
            avgPrepMinutesBase.reduce((sum, order) => {
              const diffMs = order.updatedAt.getTime() - order.createdAt.getTime();
              return sum + diffMs / 60000;
            }, 0) / avgPrepMinutesBase.length,
          );

    const statusCountMap = ordersInRange.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1;
      return acc;
    }, {});

    const statusBreakdown = Object.entries(statusCountMap)
      .map(([status, count]) => ({
        status,
        label: STATUS_LABELS[status] ?? status,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const hourlyBuckets = Array.from({ length: 24 }, (_, index) => ({
      hour: index,
      label: `${String(index).padStart(2, "0")}:00`,
      orders: 0,
    }));

    ordersInRange.forEach((order) => {
      const hour = order.createdAt.getHours();
      hourlyBuckets[hour].orders += 1;
    });

    const topItemsMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    ordersInRange.forEach((order) => {
      order.items.forEach((item) => {
        if (!item.menuItem) {
          return;
        }

        const key = item.menuItem.id;
        const existing = topItemsMap.get(key) ?? {
          name: item.menuItem.name,
          quantity: 0,
          revenue: 0,
        };

        existing.quantity += item.quantity;
        existing.revenue += Number(item.menuItem.price) * item.quantity;
        topItemsMap.set(key, existing);
      });
    });

    const topItems = Array.from(topItemsMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const waiterMap = new Map<
      string,
      { waiterId: string; waiterName: string; orders: number; items: number; revenue: number }
    >();

    ordersInRange.forEach((order) => {
      const key = order.waiter.id;
      const current = waiterMap.get(key) ?? {
        waiterId: order.waiter.id,
        waiterName: order.waiter.username,
        orders: 0,
        items: 0,
        revenue: 0,
      };

      current.orders += 1;
      current.items += order.items.reduce((sum, item) => sum + item.quantity, 0);
      current.revenue += getOrderTotal(order.items);

      waiterMap.set(key, current);
    });

    const waiterLeaderboard = Array.from(waiterMap.values())
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    const categoryMap = new Map<string, { category: string; quantity: number; revenue: number }>();
    ordersInRange.forEach((order) => {
      order.items.forEach((item) => {
        if (!item.menuItem) {
          return;
        }

        const key = item.menuItem.category;
        const current = categoryMap.get(key) ?? {
          category: item.menuItem.category,
          quantity: 0,
          revenue: 0,
        };

        current.quantity += item.quantity;
        current.revenue += Number(item.menuItem.price) * item.quantity;
        categoryMap.set(key, current);
      });
    });

    const categoryMix = Array.from(categoryMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);

    const tableSnapshot = allTables.map((table) => {
      const itemCount = table.orders.reduce(
        (sum, order) =>
          sum + order.items.reduce((innerSum, item) => innerSum + item.quantity, 0),
        0,
      );

      const totalValue = table.orders.reduce((sum, order) => {
        return (
          sum +
          order.items.reduce((innerSum, item) => {
            if (!item.menuItem) {
              return innerSum;
            }
            return innerSum + Number(item.menuItem.price) * item.quantity;
          }, 0)
        );
      }, 0);

      const statuses = table.orders.map((order) => order.status);

      return {
        tableNumber: table.number,
        activeOrders: table.orders.length,
        itemCount,
        totalValue,
        statuses,
      };
    });

    const peakHour = [...hourlyBuckets].sort((a, b) => b.orders - a.orders)[0] ?? {
      hour: 0,
      label: "00:00",
      orders: 0,
    };

    return res.status(200).json({
      range,
      fromDate,
      generatedAt: new Date(),
      kpis: {
        ordersCreated: ordersInRange.length,
        activeOrders: activeOrders.length,
        readyOrders: readyOrdersInRange.length,
        paidOrders: paidOrdersInRange.length,
        revenue,
        avgPrepMinutes,
      },
      statusBreakdown,
      hourlyLoad: hourlyBuckets,
      peakHour,
      topItems,
      waiterLeaderboard,
      categoryMix,
      tableSnapshot,
    });
  } catch {
    return res.status(500).json({ error: "Failed to fetch order insights" });
  }
};