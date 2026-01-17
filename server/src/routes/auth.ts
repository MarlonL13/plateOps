import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
});

type UserRole = "WAITER" | "KITCHEN" | "CASHIER";

export const authRouter = Router();

// Placeholder login endpoint (replace with DB lookup)
authRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  // Temporary role assignment based on username for scaffolding
  const role: UserRole = parsed.data.username.toLowerCase().includes("kitchen")
    ? "KITCHEN"
    : parsed.data.username.toLowerCase().includes("cash")
      ? "CASHIER"
      : "WAITER";

  const token = jwt.sign({ sub: parsed.data.username, role }, env.jwtSecret, {
    expiresIn: "8h",
  });

  return res.json({ token, role });
});
