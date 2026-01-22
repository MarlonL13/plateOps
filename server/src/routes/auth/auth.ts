import { Router } from "express";
import { login } from "../../controllers/auth/loginController";
import { requireAuth } from "../../middleware/auth";
import { createUser } from "../../controllers/auth/registerController";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", requireAuth, createUser);
