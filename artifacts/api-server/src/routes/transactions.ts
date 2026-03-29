import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { transactionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { z } from "zod";

const router: IRouter = Router();

router.use(requireAuth);

const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  description: z.string().optional(),
  category: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.get("/", async (req, res, next) => {
  try {
    const userId = req.session!.userId!;
    const month = req.query.month as string | undefined;
    const type = req.query.type as string | undefined;

    let rows = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, userId))
      .orderBy(desc(transactionsTable.date));

    if (month) {
      rows = rows.filter((r) => r.date.startsWith(month));
    }
    if (type) {
      rows = rows.filter((r) => r.type === type);
    }

    res.json({ transactions: rows });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const userId = req.session!.userId!;
    const parsed = createTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid transaction data" });
      return;
    }
    const { type, amount, description, category, date } = parsed.data;
    const [tx] = await db
      .insert(transactionsTable)
      .values({ userId, type, amount: String(amount), description: description ?? null, category: category ?? null, date })
      .returning();
    res.status(201).json({ transaction: tx });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.session!.userId!;
    const id = Number(req.params.id);
    await db
      .delete(transactionsTable)
      .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
