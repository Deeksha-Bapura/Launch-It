import { Router, type IRouter } from "express";
import { permitData } from "../services/permitData.js";
import { GetComplianceDeadlinesResponse, GetPermitsResponse } from "@workspace/api-zod";

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

    const upcomingDeadlines = cityData.salesTax.dueDates.map((date: string) => ({
      label: `Texas Sales Tax Filing Due`,
      date,
    }));

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

export default router;
