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

    if (req.session?.userId) {
      await db.insert(documentsTable).values({
        userId: req.session.userId,
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

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.session!.userId!;
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
