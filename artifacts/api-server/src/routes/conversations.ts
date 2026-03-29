import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { conversationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { z } from "zod";

const router: IRouter = Router();

router.use(requireAuth);

const createConversationSchema = z.object({
  title: z.string().optional(),
  messages: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
  sessionData: z.record(z.any()).optional(),
});

const updateConversationSchema = z.object({
  title: z.string().optional(),
  messages: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
  sessionData: z.record(z.any()).optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const userId = req.session!.userId!;
    const rows = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.userId, userId))
      .orderBy(desc(conversationsTable.updatedAt));
    res.json({ conversations: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const userId = req.session!.userId!;
    const id = Number(req.params.id);
    const [row] = await db
      .select()
      .from(conversationsTable)
      .where(and(eq(conversationsTable.id, id), eq(conversationsTable.userId, userId)))
      .limit(1);
    if (!row) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json({ conversation: row });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const userId = req.session!.userId!;
    const parsed = createConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data" });
      return;
    }
    const { title, messages, sessionData } = parsed.data;
    const [row] = await db
      .insert(conversationsTable)
      .values({
        userId,
        title: title ?? "New Conversation",
        messages: (messages ?? []) as any,
        sessionData: (sessionData ?? {}) as any,
      })
      .returning();
    res.status(201).json({ conversation: row });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const userId = req.session!.userId!;
    const id = Number(req.params.id);
    const parsed = updateConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data" });
      return;
    }
    const updates: Record<string, any> = { updatedAt: new Date() };
    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.messages !== undefined) updates.messages = parsed.data.messages;
    if (parsed.data.sessionData !== undefined) updates.sessionData = parsed.data.sessionData;

    const [row] = await db
      .update(conversationsTable)
      .set(updates)
      .where(and(eq(conversationsTable.id, id), eq(conversationsTable.userId, userId)))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json({ conversation: row });
  } catch (err) {
    next(err);
  }
});

export default router;
