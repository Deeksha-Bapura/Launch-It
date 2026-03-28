import { Router, type IRouter } from "express";
import { chat } from "../services/claudeService.js";
import { classifyBusiness } from "../services/permitData.js";
import { SendMessageBody, SendMessageResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/", async (req, res, next) => {
  try {
    const parsed = SendMessageBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "messages is required and must be an array" });
      return;
    }

    const { messages } = parsed.data;

    const reply = await chat(messages as Array<{ role: string; content: string }>);

    const allContent = messages.map((m) => m.content).join(" ");
    const detectedBusinessType = classifyBusiness(allContent);

    const suggestDocuments = messages.length >= 4 && detectedBusinessType !== "general";

    const response = SendMessageResponse.parse({
      reply,
      detectedBusinessType,
      suggestDocuments,
    });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
