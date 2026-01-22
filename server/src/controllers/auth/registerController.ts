import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "../../prisma";

const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
  role: z.enum(["WAITER", "KITCHEN", "CASHIER"]),
});

export const createUser = async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid user data" });
  }

  const { username, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return res.status(409).json({ error: "Username already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      role,
    },
  });

  return res
    .status(201)
    .json({ id: user.id, username: user.username, role: user.role });
};
