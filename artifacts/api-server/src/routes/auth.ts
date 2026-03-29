import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { usersTable, transactionsTable, conversationsTable, documentsTable, type User } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

function safeUser(user: User): Omit<User, "passwordHash"> {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  state: z.string().optional(),
  businessDescription: z.string().optional(),
  registrationStatus: z.string().optional(),
  yearStarted: z.string().optional(),
  description: z.string().optional(),
  photoUrl: z.string().optional(),
  logoUrl: z.string().optional(),
});

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "email, password (min 6 chars), and name are required" });
      return;
    }
    const { email, password, name } = parsed.data;

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(usersTable)
      .values({ email: email.toLowerCase(), passwordHash, name: name ?? "" })
      .returning();

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json({ user: safeUser(user) });
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    (err: Error | null, user: User | false, info: { message?: string } | undefined) => {
      if (err) return next(err);
      if (!user) {
        res.status(401).json({ error: info?.message ?? "Invalid credentials" });
        return;
      }
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        res.json({ user: safeUser(user) });
      });
    }
  )(req, res, next);
});

router.post("/logout", (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

router.get("/me", (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ user: safeUser(req.user as User) });
});

router.patch("/me", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid profile data" });
      return;
    }

    const userId = (req.user as User).id;
    const [updated] = await db
      .update(usersTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(usersTable.id, userId))
      .returning();

    res.json({ user: safeUser(updated) });
  } catch (err) {
    next(err);
  }
});

router.patch("/change-password", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data. New password must be at least 6 characters." });
      return;
    }
    const { currentPassword, newPassword } = parsed.data;
    const userId = (req.user as User).id;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }
    const newHash = await bcrypt.hash(newPassword, 12);
    await db.update(usersTable).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(usersTable.id, userId));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/user", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const userId = (req.user as User).id;
    await db.delete(transactionsTable).where(eq(transactionsTable.userId, userId));
    await db.delete(conversationsTable).where(eq(conversationsTable.userId, userId));
    await db.delete(documentsTable).where(eq(documentsTable.userId, userId));
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    req.logout((err) => {
      if (err) return next(err);
      res.json({ ok: true });
    });
  } catch (err) {
    next(err);
  }
});

export default router;
