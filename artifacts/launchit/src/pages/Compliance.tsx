import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { CheckSquare, Square, AlertCircle, ExternalLink, MapPin, Loader2, Clock } from "lucide-react";
import { Link } from "wouter";
import { differenceInDays, parseISO, format } from "date-fns";

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

// Generic static permit checklist that applies nationwide
const GENERIC_PERMITS = [
  {
    name: "DBA / Trade Name Registration",
    required: "Conditional",
    details: 'Required if you operate under any name other than your legal name. Filed with your county clerk — search "[your county] assumed name filing" to find the form. Typically costs $10–35.',
    link: null,
  },
  {
    name: "State Sales Tax / Seller's Permit",
    required: "Conditional",
    details: "Required in most states if you sell taxable goods or services. Register free at your state's department of revenue or taxation website. Check whether your service type is taxable in your state.",
    link: null,
  },
  {
    name: "Federal EIN (Employer Identification Number)",
    required: "Recommended",
    details: "Free to get from the IRS. Useful for opening a business bank account, filing taxes, and looking professional. Takes 5 minutes online.",
    link: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online",
  },
  {
    name: "Local Business / Home Occupation Permit",
    required: "Conditional",
    details: 'Some cities require a home occupation permit if you run a business from your residence. Search "[your city] home occupation permit" or call your city clerk to check.',
    link: null,
  },
  {
    name: "Industry-Specific License",
    required: "Conditional",
    details: "Many industries require a state license: cosmetology, food handling, childcare, contracting, etc. Search your state's licensing board for your profession.",
    link: "https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits",
  },
  {
    name: "Federal Self-Employment Taxes",
    required: "Required",
    details: "If you earn more than $400/year from self-employment, you must file a Schedule SE with your federal tax return. Quarterly estimated tax payments are due April 15, June 15, September 15, and January 15.",
    link: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center",
  },
];

const FOOD_PERMITS = [
  {
    name: "Cottage Food Law Exemption",
    required: "Conditional",
    details: "Most US states have a cottage food law allowing home bakers and food producers to sell directly to consumers without a commercial kitchen inspection, up to a revenue limit. Search '[your state] cottage food law' for your state's specific rules.",
    link: "https://www.forrager.com/law/",
  },
  {
    name: "Food Handler's Permit",
    required: "Conditional",
    details: "Some states or counties require a food handler's card even for cottage food operators. Check with your local health department.",
    link: null,
  },
];

const BEAUTY_PERMITS = [
  {
    name: "State Cosmetology License",
    required: "Required",
    details: "Every US state requires a cosmetology, esthetics, or nail technician license issued by the state licensing board. You must graduate from an accredited program and pass a state exam.",
    link: "https://www.nails.com/articles/cosmetology-licensing-requirements-by-state",
  },
];

const CLEANING_PERMITS = [
  {
    name: "General Liability Insurance",
    required: "Recommended",
    details: "Most residential cleaning clients require proof of liability insurance. A $1M policy typically costs $400–800/year. Protects you if something is damaged or someone is injured.",
    link: null,
  },
  {
    name: "Sales Tax on Cleaning Services",
    required: "Conditional",
    details: "Some states tax cleaning services; others don't. Check your state's department of revenue to see if you need to collect and remit sales tax.",
    link: "https://www.avalara.com/taxrates/en/state-rates.html",
  },
];

function getExtraPermits(businessType: string) {
  const bt = businessType.toLowerCase();
  if (bt.includes("food") || bt.includes("bak") || bt.includes("cook") || bt.includes("catering")) return FOOD_PERMITS;
  if (bt.includes("nail") || bt.includes("beauty") || bt.includes("cosmet") || bt.includes("hair") || bt.includes("esthetician")) return BEAUTY_PERMITS;
  if (bt.includes("clean")) return CLEANING_PERMITS;
  return [];
}

function fetchDeadlines(city: string) {
  return fetch(`${BASE}/compliance/deadlines?city=${encodeURIComponent(city)}`, { credentials: "include" }).then((r) =>
    r.ok ? r.json() : { upcomingDeadlines: [] }
  );
}

export default function Compliance() {
  const { user } = useAuth();
  const state = user?.state ?? "";
  const businessType = user?.businessType ?? "general";
  const userId = user?.id ?? 0;

  // Only use the TX deadlines if user is in TX (existing static data)
  const isTX = state.toLowerCase().includes("tx") || state.toLowerCase() === "texas";
  const txCity = state.toLowerCase().includes("austin") ? "austin" : "houston";

  const STORAGE_KEY = `launchit_compliance_checks_${userId}`;

  const getChecks = (): Record<string, boolean> => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      return {};
    }
  };

  const [checks, setChecks] = useState<Record<string, boolean>>(getChecks);

  const toggleCheck = (key: string) => {
    const newChecks = { ...checks, [key]: !checks[key] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newChecks));
    setChecks(newChecks);
  };

  const { data: deadlinesData } = useQuery({
    queryKey: ["deadlines", txCity],
    queryFn: () => fetchDeadlines(txCity),
    enabled: !!user && isTX,
  });

  const deadlines = deadlinesData?.upcomingDeadlines ?? [];

  const allPermits = [...GENERIC_PERMITS, ...getExtraPermits(businessType)];

  if (user && !state) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">Compliance Checklist</h1>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 flex flex-col items-center text-center gap-4">
            <MapPin className="w-10 h-10 text-amber-500" />
            <div>
              <h2 className="font-bold text-amber-800 text-lg">Tell us where you're based</h2>
              <p className="text-amber-700 text-sm mt-1 max-w-md">
                Update your profile with your state to get location-specific compliance guidance alongside these universal requirements.
              </p>
            </div>
            <Link
              href="/profile"
              className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
            >
              Update My Profile
            </Link>
          </div>

          {/* Still show the generic checklist even without state */}
          <PermitChecklist permits={allPermits} checks={checks} toggleCheck={toggleCheck} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">Compliance Checklist</h1>
          <p className="text-muted-foreground mt-1">
            Requirements for{" "}
            <span className="font-semibold capitalize">{businessType}</span> businesses
            {state ? (
              <> in <span className="font-semibold">{state}</span></>
            ) : null}.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            This is general guidance only. Requirements vary by state and change over time — always verify with the relevant agency before making business decisions.
          </p>
        </div>

        {deadlines.length > 0 && (
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Upcoming Deadlines
            </h2>
            <div className="space-y-3">
              {deadlines.map((d: any, i: number) => {
                const daysLeft = differenceInDays(parseISO(d.date), new Date());
                const urgent = daysLeft < 14;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${urgent ? "border-red-200 bg-red-50" : "border-border"}`}>
                    <div className={`text-2xl font-bold tabular-nums ${urgent ? "text-red-600" : "text-foreground"}`}>
                      {daysLeft > 0 ? daysLeft : 0}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{d.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {format(parseISO(d.date), "MMMM d, yyyy")} · {daysLeft > 0 ? `${daysLeft} days left` : "Due today"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <PermitChecklist permits={allPermits} checks={checks} toggleCheck={toggleCheck} />
      </div>
    </Layout>
  );
}

function PermitChecklist({
  permits,
  checks,
  toggleCheck,
}: {
  permits: typeof GENERIC_PERMITS;
  checks: Record<string, boolean>;
  toggleCheck: (key: string) => void;
}) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <h2 className="font-bold text-foreground mb-4">Permit Checklist</h2>
      <div className="space-y-4">
        {permits.map((permit, i) => {
          const key = `permit_${i}_${permit.name}`;
          const checked = checks[key] ?? false;
          return (
            <div
              key={i}
              className={`p-4 rounded-xl border transition-colors ${
                checked ? "border-emerald-200 bg-emerald-50" : "border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleCheck(key)}
                  className="mt-0.5 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                  aria-label={checked ? "Mark incomplete" : "Mark complete"}
                >
                  {checked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`font-semibold text-sm ${
                        checked ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {permit.name}
                    </h3>
                    {permit.link && (
                      <a
                        href={permit.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-xs flex-shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" /> Link
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="font-medium">Required:</span> {permit.required}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{permit.details}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
