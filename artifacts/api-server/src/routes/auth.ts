import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { usersTable, type User } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function safeUser(user: User): Omit<User, "passwordHash"> {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
    if (!email || !password || !name) {
      res.status(400).json({ error: "email, password, and name are required" });
      return;
    }

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
      .values({ email: email.toLowerCase(), passwordHash, name })
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
    const userId = (req.user as User).id;
    const {
      businessName,
      state,
      businessDescription,
      businessType,
      registrationStatus,
      yearStarted,
      phone,
      photoUrl,
    } = req.body as {
      businessName?: string;
      state?: string;
      businessDescription?: string;
      businessType?: string;
      registrationStatus?: string;
      yearStarted?: string;
      phone?: string;
      photoUrl?: string;
    };

    const updates: Partial<Omit<User, "id" | "email" | "passwordHash" | "createdAt">> = {};
    if (businessName !== undefined) updates.businessName = businessName;
    if (state !== undefined) updates.state = state;
    if (businessDescription !== undefined) updates.businessDescription = businessDescription;
    if (businessType !== undefined) updates.businessType = businessType;
    if (registrationStatus !== undefined) updates.registrationStatus = registrationStatus;
    if (yearStarted !== undefined) updates.yearStarted = yearStarted;
    if (phone !== undefined) updates.phone = phone;
    if (photoUrl !== undefined) updates.photoUrl = photoUrl;

    const [updated] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, userId))
      .returning();

    res.json({ user: safeUser(updated) });
  } catch (err) {
    next(err);
  }
});

export default router;
