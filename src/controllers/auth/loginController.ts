import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env";
import bcrypt from "bcrypt";
import prisma from "../../prisma";

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
});

type UserRole = "WAITER" | "KITCHEN" | "CASHIER";

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const { username, password } = parsed.data;

  // Find user in DB
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Compare password hash
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const role: UserRole = user.role as UserRole;

  const token = jwt.sign({ sub: user.id, role }, env.jwtSecret, {
    expiresIn: "50y",
  });

  return res.json({ token, role, userId: user.id });
};
