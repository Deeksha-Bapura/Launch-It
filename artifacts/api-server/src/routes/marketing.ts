import { Router, type IRouter } from "express";
import { chat } from "../services/claudeService.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { z } from "zod";

const router: IRouter = Router();

router.use(requireAuth);

const captionSchema = z.object({
  businessType: z.string(),
  description: z.string(),
  imageContext: z.string().optional(),
});

const platformSchema = z.object({
  businessType: z.string(),
  targetAudience: z.string(),
  contentGoal: z.string(),
});

const calendarSchema = z.object({
  businessType: z.string(),
  businessName: z.string().optional(),
  focus: z.string().optional(),
});

router.post("/caption", async (req, res, next) => {
  try {
    const parsed = captionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data" });
      return;
    }
    const { businessType, description, imageContext } = parsed.data;
    const prompt = `You are a social media copywriter. Generate exactly 3 Instagram captions for a ${businessType} business. Post context: "${description}"${imageContext ? `. Image shows: ${imageContext}` : ""}. 

Return a JSON object with this exact structure:
{
  "captions": [
    { "text": "caption 1 text", "hashtags": ["tag1", "tag2", "tag3"] },
    { "text": "caption 2 text", "hashtags": ["tag1", "tag2", "tag3"] },
    { "text": "caption 3 text", "hashtags": ["tag1", "tag2", "tag3"] }
  ]
}

Each caption should be 1-3 sentences, engaging, and authentic. Each caption gets 5-8 relevant hashtags (without the # symbol). Return only valid JSON.`;

    const rawReply = await chat([{ role: "user", content: prompt }]);
    let captions;
    try {
      const match = rawReply.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : rawReply);
      captions = parsed.captions;
    } catch {
      captions = [
        { text: rawReply, hashtags: ["smallbusiness", "entrepreneur", "hustle"] }
      ];
    }
    res.json({ captions });
  } catch (err) {
    next(err);
  }
});

router.post("/platform-recommendation", async (req, res, next) => {
  try {
    const parsed = platformSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data" });
      return;
    }
    const { businessType, targetAudience, contentGoal } = parsed.data;
    const prompt = `You are a digital marketing expert. Recommend the best 2 social media platforms for a ${businessType} business whose target audience is "${targetAudience}" and whose main content goal is "${contentGoal}".

Return a JSON object with this exact structure:
{
  "platforms": [
    { "name": "Platform Name", "reason": "Why this platform works for them", "icon": "icon-name", "tips": ["tip1", "tip2"] },
    { "name": "Platform Name", "reason": "Why this platform works for them", "icon": "icon-name", "tips": ["tip1", "tip2"] }
  ]
}

For icon, use one of: "instagram", "facebook", "twitter", "tiktok", "youtube", "linkedin", "pinterest". Return only valid JSON.`;

    const rawReply = await chat([{ role: "user", content: prompt }]);
    let platforms;
    try {
      const match = rawReply.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : rawReply);
      platforms = parsed.platforms;
    } catch {
      platforms = [
        { name: "Instagram", reason: "Great for visual businesses", icon: "instagram", tips: ["Post consistently", "Use Stories"] },
        { name: "Facebook", reason: "Broad audience reach", icon: "facebook", tips: ["Join local groups", "Boost posts"] }
      ];
    }
    res.json({ platforms });
  } catch (err) {
    next(err);
  }
});

router.post("/content-calendar", async (req, res, next) => {
  try {
    const parsed = calendarSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data" });
      return;
    }
    const { businessType, businessName, focus } = parsed.data;
    const prompt = `You are a content strategist. Create a 7-day social media content calendar for a ${businessType} business${businessName ? ` called "${businessName}"` : ""}${focus ? ` with a focus on: ${focus}` : ""}.

Return a JSON object with this exact structure:
{
  "days": [
    { "day": "Monday", "theme": "short theme", "contentIdea": "specific post idea", "type": "post type like Photo/Video/Story/Reel" },
    { "day": "Tuesday", "theme": "short theme", "contentIdea": "specific post idea", "type": "post type" },
    { "day": "Wednesday", "theme": "short theme", "contentIdea": "specific post idea", "type": "post type" },
    { "day": "Thursday", "theme": "short theme", "contentIdea": "specific post idea", "type": "post type" },
    { "day": "Friday", "theme": "short theme", "contentIdea": "specific post idea", "type": "post type" },
    { "day": "Saturday", "theme": "short theme", "contentIdea": "specific post idea", "type": "post type" },
    { "day": "Sunday", "theme": "short theme", "contentIdea": "specific post idea", "type": "post type" }
  ]
}

Make content ideas specific and actionable. Return only valid JSON.`;

    const rawReply = await chat([{ role: "user", content: prompt }]);
    let days;
    try {
      const match = rawReply.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : rawReply);
      days = parsed.days;
    } catch {
      const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      days = weekDays.map((day) => ({
        day,
        theme: "Showcase your work",
        contentIdea: `Share a behind-the-scenes look at your ${businessType} business`,
        type: "Photo"
      }));
    }
    res.json({ days });
  } catch (err) {
    next(err);
  }
});

export default router;
