import { Router, type IRouter } from "express";
import {
  generateInvoice,
  generateProfitLossTracker,
  generatePricingWorksheet,
  generateSocialPost,
} from "../services/documentTemplates.js";
import { GenerateDocumentBody, GenerateDocumentResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { documentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { chat } from "../services/claudeService.js";
import type { User } from "@workspace/db/schema";

const router: IRouter = Router();

const DOC_TITLES: Record<string, string> = {
  invoice: "Invoice Template",
  profit_loss: "Profit & Loss Tracker",
  pricing: "Pricing Calculator",
  social_post: "Social Media Post",
};

router.post("/generate", async (req, res, next) => {
  try {
    const parsed = GenerateDocumentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "type is required" });
      return;
    }

    const { type, businessName, ownerName, city, product } = parsed.data;

    let document: Record<string, any>;

    switch (type) {
      case "invoice":
        document = generateInvoice(businessName ?? "", ownerName ?? "", city ?? "");
        break;
      case "profit_loss":
        document = generateProfitLossTracker("");
        break;
      case "pricing":
        document = generatePricingWorksheet(product ?? "Your Product");
        break;
      case "social_post":
        document = generateSocialPost(businessName ?? "", product ?? "", city ?? "");
        break;
      default:
        res.status(400).json({ error: `Unrecognised document type: ${type}` });
        return;
    }

    if (req.isAuthenticated() && req.user) {
      await db.insert(documentsTable).values({
        userId: (req.user as User).id,
        type,
        title: DOC_TITLES[type] ?? type,
        content: document as any,
      });
    }

    const response = GenerateDocumentResponse.parse({ document });
    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post("/pricing-analysis", requireAuth, async (req, res, next) => {
  try {
    const { businessType, city, service } = req.body as { businessType?: string; city?: string; service?: string };

    const serviceLabel = service || businessType || "this service";
    const cityLabel = city || "this area";

    const prompt = `You are a pricing research expert. A small business owner does "${serviceLabel}" in ${cityLabel}.

Research realistic market pricing for this specific service in this area and give them a pricing breakdown with:
- The LOW end (entry-level, newer providers)
- The AVERAGE (what most established providers charge)
- The HIGH end (premium/experienced providers)

Format your response EXACTLY as JSON like this (no markdown, just raw JSON):
{
  "service": "the service name",
  "location": "the city/area",
  "low": 45,
  "average": 75,
  "high": 120,
  "unit": "per session",
  "currency": "USD",
  "insights": "2-3 sentences explaining what drives pricing in this market and what factors let someone charge at the high end"
}

Only return the JSON object, nothing else.`;

    const raw = await chat([{ role: "user", content: prompt }]);

    let analysis: Record<string, unknown>;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      res.status(500).json({ error: "Failed to parse pricing analysis" });
      return;
    }

    res.json({ analysis });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = (req.user as User).id;
    const rows = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.userId, userId))
      .orderBy(documentsTable.createdAt);
    res.json({ documents: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
