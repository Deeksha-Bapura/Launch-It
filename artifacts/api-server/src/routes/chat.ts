import { Router, type IRouter } from "express";
import { chat } from "../services/claudeService.js";
import { classifyBusiness } from "../services/permitData.js";
import { SendMessageBody, SendMessageResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const US_STATES: Record<string, string> = {
  alabama: "Alabama", alaska: "Alaska", arizona: "Arizona", arkansas: "Arkansas",
  california: "California", colorado: "Colorado", connecticut: "Connecticut",
  delaware: "Delaware", florida: "Florida", georgia: "Georgia", hawaii: "Hawaii",
  idaho: "Idaho", illinois: "Illinois", indiana: "Indiana", iowa: "Iowa",
  kansas: "Kansas", kentucky: "Kentucky", louisiana: "Louisiana", maine: "Maine",
  maryland: "Maryland", massachusetts: "Massachusetts", michigan: "Michigan",
  minnesota: "Minnesota", mississippi: "Mississippi", missouri: "Missouri",
  montana: "Montana", nebraska: "Nebraska", nevada: "Nevada",
  "new hampshire": "New Hampshire", "new jersey": "New Jersey", "new mexico": "New Mexico",
  "new york": "New York", "north carolina": "North Carolina", "north dakota": "North Dakota",
  ohio: "Ohio", oklahoma: "Oklahoma", oregon: "Oregon", pennsylvania: "Pennsylvania",
  "rhode island": "Rhode Island", "south carolina": "South Carolina", "south dakota": "South Dakota",
  tennessee: "Tennessee", texas: "Texas", utah: "Utah", vermont: "Vermont",
  virginia: "Virginia", washington: "Washington", "west virginia": "West Virginia",
  wisconsin: "Wisconsin", wyoming: "Wyoming",
};

const STATE_ABBRS: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

function detectState(text: string): string | null {
  const lower = text.toLowerCase();
  // Check full state names (longer names first to avoid partial matches)
  const sorted = Object.keys(US_STATES).sort((a, b) => b.length - a.length);
  for (const name of sorted) {
    if (lower.includes(name)) {
      return US_STATES[name];
    }
  }
  // Check abbreviations with word boundaries
  const words = text.toUpperCase().split(/\W+/);
  for (const word of words) {
    if (STATE_ABBRS[word]) {
      return STATE_ABBRS[word];
    }
  }
  return null;
}

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

    // Only detect state from user messages (not assistant)
    const userContent = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(" ");
    const detectedState = detectState(userContent) ?? undefined;

    const suggestDocuments = messages.length >= 4 && detectedBusinessType !== "general";

    const response = SendMessageResponse.parse({
      reply,
      detectedBusinessType,
      suggestDocuments,
      detectedState,
    });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
