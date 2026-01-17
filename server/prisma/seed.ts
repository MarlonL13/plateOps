import {
  PrismaClient,
  UserRole,
  TableStatus,
  OrderStatus,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  // Create Users
  const waiter = await prisma.user.create({
    data: {
      username: "waiter1",
      passwordHash: "hashedpassword1",
      role: UserRole.WAITER,
    },
  });
  await prisma.user.create({
    data: {
      username: "kitchen1",
      passwordHash: "hashedpassword2",
      role: UserRole.KITCHEN,
    },
  });
  await prisma.user.create({
    data: {
      username: "cashier1",
      passwordHash: "hashedpassword3",
      role: UserRole.CASHIER,
    },
  });

  // Create Table
  const table = await prisma.table.create({
    data: {
      number: 1,
      status: TableStatus.OPEN,
    },
  });

  // Create MenuItem
  const menuItem = await prisma.menuItem.create({
    data: {
      name: "Burger",
      price: new Decimal(9.99),
    },
  });

  // Create Order
  const order = await prisma.order.create({
    data: {
      tableId: table.id,
      waiterId: waiter.id,
      status: OrderStatus.PENDING,
      notes: "No onions",
      items: {
        create: [
          {
            menuItemId: menuItem.id,
            quantity: 2,
          },
        ],
      },
    },
    include: { items: true },
  });

  // Create Payment
  await prisma.payment.create({
    data: {
      orderId: order.id,
      tableId: table.id,
      total: new Decimal(19.98),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
