import { Router, type IRouter } from "express";
import { permitData } from "../services/permitData.js";
import { GetComplianceDeadlinesResponse, GetPermitsResponse } from "@workspace/api-zod";
import { chat } from "../services/claudeService.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router: IRouter = Router();

router.get("/deadlines", (req, res, next) => {
  try {
    const city = (req.query.city as string || "").toLowerCase();
    const cityData = permitData[city];

    if (!cityData) {
      res.status(404).json({
        error: `City "${city}" not found. LaunchIt currently supports Houston and Austin, TX only.`,
      });
      return;
    }

    const now = new Date();
    const upcomingDeadlines = cityData.salesTax.dueDates.map((dateStr: string) => {
      // dateStr is like "April 20" — parse it and assign the nearest upcoming year
      const parsed = new Date(`${dateStr}, ${now.getFullYear()}`);
      if (isNaN(parsed.getTime())) return { label: "Texas Sales Tax Filing Due", date: dateStr };
      if (parsed < now) parsed.setFullYear(now.getFullYear() + 1);
      const iso = parsed.toISOString().split("T")[0];
      return { label: "Texas Sales Tax Filing Due", date: iso };
    });

    const response = GetComplianceDeadlinesResponse.parse({
      city,
      upcomingDeadlines,
      salesTaxRate: cityData.salesTax.rate,
      generalLicenseRequired: cityData.generalBusinessLicense.required,
    });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.get("/permits", (req, res, next) => {
  try {
    const city = (req.query.city as string || "").toLowerCase();
    const businessType = (req.query.businessType as string || "general").toLowerCase();

    const cityData = permitData[city];

    if (!cityData) {
      res.status(404).json({
        error: `City "${city}" not found. LaunchIt currently supports Houston and Austin, TX only.`,
      });
      return;
    }

    const permits: Record<string, any>[] = [];

    permits.push({
      name: "Sales Tax Registration",
      required: "Conditional",
      details: cityData.salesTax.threshold,
      rate: cityData.salesTax.rate,
      dueDates: cityData.salesTax.dueDates,
      link: cityData.salesTax.registrationLink,
    });

    permits.push({
      name: "DBA (Doing Business As)",
      required: cityData.dba.required,
      cost: cityData.dba.cost,
      filedWith: cityData.dba.filedWith,
      link: cityData.dba.link,
    });

    if (businessType === "food") {
      permits.push({
        name: "Texas Cottage Food Law",
        required: "Exemption available — no permit needed",
        applies: cityData.cottageFoodLaw.applies,
        annualRevenueLimit: cityData.cottageFoodLaw.annualRevenueLimit,
        requirements: cityData.cottageFoodLaw.requirements,
        cost: cityData.cottageFoodLaw.cost,
        link: cityData.cottageFoodLaw.link,
      });
    }

    if (businessType === "beauty") {
      permits.push({
        name: "Texas Cosmetology License",
        required: "Required",
        details: cityData.beautyServices.license,
        cost: cityData.beautyServices.cost,
        licensingBoard: cityData.beautyServices.licensingBoard,
        notes: cityData.beautyServices.notes,
        link: cityData.beautyServices.link,
      });
    }

    if (businessType === "cleaning") {
      permits.push({
        name: "Cleaning Services Requirements",
        required: "No license required",
        details: cityData.cleaningServices.license,
        salesTaxNote: cityData.cleaningServices.salesTaxNote,
        notes: cityData.cleaningServices.notes,
        link: cityData.cleaningServices.link,
      });
    }

    if (businessType === "landscaping") {
      permits.push({
        name: "Landscaping Requirements",
        required: "No license for basic lawn care",
        details: cityData.landscaping.license,
        pesticideNote: cityData.landscaping.pesticideNote,
        notes: cityData.landscaping.notes,
        link: cityData.landscaping.link,
      });
    }

    const disclaimer =
      "This is general guidance only, scoped to Houston and Austin, TX. Requirements change — always verify with the relevant agency before making business decisions.";

    const response = GetPermitsResponse.parse({
      city,
      businessType,
      permits,
      disclaimer,
    });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.get("/guide", requireAuth, async (req, res, next) => {
  try {
    const state = (req.query.state as string || "").trim();
    const businessType = (req.query.businessType as string || "general").trim();

    if (!state) {
      res.status(400).json({ error: "state is required" });
      return;
    }

    const prompt = `You are a US small business compliance expert. A ${businessType} business owner is starting a business in ${state}.

List the key permits, licenses, and registrations they typically need. Be practical and focused on the most common requirements for informal/home-based operators.

Return ONLY a JSON object with this exact structure (no markdown, no explanation, just JSON):
{
  "location": "${state}",
  "businessType": "${businessType}",
  "permits": [
    {
      "name": "permit or license name",
      "required": "Required / Conditional / Recommended",
      "details": "brief explanation of what this is and who needs it",
      "cost": "typical cost or free",
      "notes": "any important caveats or next steps"
    }
  ],
  "disclaimer": "one sentence disclaimer about verifying requirements"
}

Include 4-6 items covering: business licenses, state tax registration, any industry-specific licenses for ${businessType}, and DBA/trade name registration. Return only valid JSON.`;

    const raw = await chat([{ role: "user", content: prompt }]);

    let guide: Record<string, unknown>;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      guide = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      res.status(500).json({ error: "Failed to parse compliance guide" });
      return;
    }

    res.json(guide);
  } catch (err) {
    next(err);
  }
});

export default router;
