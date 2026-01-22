import { Router } from "express";
import { getAllItens } from "../../controllers/itens/getAllItens";
import { requireAuth } from "../../middleware/auth";

export const itensRouter = Router();

// Get all items grouped by category
itensRouter.get("/", requireAuth, getAllItens);
