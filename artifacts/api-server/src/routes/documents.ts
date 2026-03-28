import { Router, type IRouter } from "express";
import {
  generateInvoice,
  generateProfitLossTracker,
  generatePricingWorksheet,
  generateSocialPost,
} from "../services/documentTemplates.js";
import { GenerateDocumentBody, GenerateDocumentResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/generate", (req, res, next) => {
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

    const response = GenerateDocumentResponse.parse({ document });
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
