import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getAllTables } from "../../controllers/orders/getAllTables";
import { createOrder } from "../../controllers/orders/createOrder";
import { getAllOrders } from "../../controllers/orders/getAllOrders";
import { getAllOrdersCashier } from "../../controllers/orders/gellAllOrdersCashier";
import { getTableData } from "../../controllers/orders/getTableData";
import { updateOrderStatus } from "../../controllers/orders/updateStatus";
import { payOrders } from "../../controllers/orders/payOrder";

export const ordersRouter = Router();

// List all tables (default route)
ordersRouter.get("", requireAuth, getAllTables);

// Create a new order
ordersRouter.post("/create", requireAuth, createOrder);

// Get all orders grouped by status (for kitchen)
ordersRouter.get("/all", requireAuth, getAllOrders);

// Get all orders for cashier (tables, totals, etc.)
ordersRouter.get("/cashier", requireAuth, getAllOrdersCashier);

// Get detailed data for a specific table
ordersRouter.post("/table", requireAuth, getTableData);

// Update order status (pending -> in progress -> ready)
ordersRouter.post("/update-status", requireAuth, updateOrderStatus);

// Pay all active orders for a table
ordersRouter.post("/pay", requireAuth, payOrders);
