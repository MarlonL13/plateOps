import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.table.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const password1 = await bcrypt.hash("waiter", 10);
  const password2 = await bcrypt.hash("kitchen", 10);
  const password3 = await bcrypt.hash("cashier", 10);

  // Create Users
  const waiter = await prisma.user.create({
    data: {
      username: "waiter1",
      passwordHash: password1,
      role: "WAITER", // Use string
    },
  });
  await prisma.user.create({
    data: {
      username: "kitchen1",
      passwordHash: password2,
      role: "KITCHEN", // Use string
    },
  });
  await prisma.user.create({
    data: {
      username: "cashier1",
      passwordHash: password3,
      role: "CASHIER", // Use string
    },
  });

  // Create 10 Tables
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    tables.push(
      await prisma.table.create({
        data: {
          number: i,
          status: "OPEN", // Use string
        },
      })
    );
  }

  // Create MenuItems
  const menuItems = [
    { name: "Burger", price: new Decimal(9.99), category: "Main" },
    { name: "Cheeseburger", price: new Decimal(10.99), category: "Main" },
    { name: "Veggie Burger", price: new Decimal(9.49), category: "Main" },
    { name: "Fries", price: new Decimal(3.99), category: "Side" },
    { name: "Sweet Potato Fries", price: new Decimal(4.49), category: "Side" },
    { name: "Onion Rings", price: new Decimal(4.99), category: "Side" },
    { name: "Caesar Salad", price: new Decimal(7.99), category: "Salad" },
    { name: "Greek Salad", price: new Decimal(8.49), category: "Salad" },
    { name: "Chicken Wings", price: new Decimal(11.99), category: "Appetizer" },
    { name: "Mozzarella Sticks", price: new Decimal(6.99), category: "Appetizer" },
    { name: "Coke", price: new Decimal(2.50), category: "Drink" },
    { name: "Sprite", price: new Decimal(2.50), category: "Drink" },
    { name: "Orange Juice", price: new Decimal(3.00), category: "Drink" },
    { name: "Water", price: new Decimal(1.50), category: "Drink" },
    { name: "Chocolate Cake", price: new Decimal(5.50), category: "Dessert" },
    { name: "Ice Cream", price: new Decimal(4.00), category: "Dessert" },
    { name: "Apple Pie", price: new Decimal(5.00), category: "Dessert" },
    { name: "Espresso", price: new Decimal(2.00), category: "Drink" },
    { name: "Latte", price: new Decimal(3.50), category: "Drink" },
    { name: "Grilled Chicken Sandwich", price: new Decimal(10.99), category: "Main" },
    { name: "Fish & Chips", price: new Decimal(12.99), category: "Main" },
    { name: "Steak", price: new Decimal(18.99), category: "Main" },
    { name: "Pasta Alfredo", price: new Decimal(13.49), category: "Main" },
    { name: "Tiramisu", price: new Decimal(6.50), category: "Dessert" },
    { name: "Lemonade", price: new Decimal(2.75), category: "Drink" },
    { name: "Club Sandwich", price: new Decimal(9.99), category: "Main" },
    { name: "Garden Salad", price: new Decimal(6.99), category: "Salad" },
    { name: "Nachos", price: new Decimal(7.99), category: "Appetizer" },
    { name: "Chicken Tenders", price: new Decimal(8.99), category: "Appetizer" },
    { name: "Brownie", price: new Decimal(4.50), category: "Dessert" },
  ];

  const createdMenuItems = [];
  for (const item of menuItems) {
    createdMenuItems.push(await prisma.menuItem.create({ data: item }));
  }

  // Create an Order for Table 1
  const order = await prisma.order.create({
    data: {
      tableId: tables[0].id,
      waiterId: waiter.id,
      status: "PENDING",
      notes: "No onions",
      items: {
        create: [
          {
            menuItemId: createdMenuItems[0].id, // Burger
            quantity: 2,
          },
          {
            menuItemId: createdMenuItems[3].id, // Fries
            quantity: 1,
          },
          {
            menuItemId: createdMenuItems[10].id, // Coke
            quantity: 2,
          },
        ],
      },
    },
    include: { items: true },
  });

  // Create Payment for Table 1
  await prisma.payment.create({
    data: {
      orderId: order.id,
      tableId: tables[0].id,
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
