import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { useAuth } from "@/context/AuthContext";
import { differenceInDays, parseISO, format } from "date-fns";
import { CheckSquare, Square, AlertCircle, ExternalLink, Clock } from "lucide-react";

const BASE = "/api";

function getCity(user: any) {
  const state = (user?.state ?? "").toLowerCase();
  if (state.includes("austin") || state === "travis") return "austin";
  return "houston";
}

function fetchPermits(city: string, businessType: string) {
  return fetch(`${BASE}/compliance/permits?city=${encodeURIComponent(city)}&businessType=${encodeURIComponent(businessType)}`, {
    credentials: "include",
  }).then((r) => (r.ok ? r.json() : { permits: [], disclaimer: "" }));
}

function fetchDeadlines(city: string) {
  return fetch(`${BASE}/compliance/deadlines?city=${encodeURIComponent(city)}`, { credentials: "include" }).then((r) =>
    r.ok ? r.json() : { upcomingDeadlines: [] }
  );
}

export default function Compliance() {
  const { user } = useAuth();
  const city = getCity(user);
  const businessType = user?.businessType ?? "general";
  const userId = user?.id ?? 0;

  const STORAGE_KEY = `launchit_compliance_checks_${userId}`;

  const getChecks = (): Record<string, boolean> => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      return {};
    }
  };

  const saveCheck = (key: string, value: boolean) => {
    const checks = getChecks();
    checks[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
  };

  const { data: permitsData, isLoading: permitsLoading } = useQuery({
    queryKey: ["permits", city, businessType],
    queryFn: () => fetchPermits(city, businessType),
    enabled: !!user,
  });

  const { data: deadlinesData } = useQuery({
    queryKey: ["deadlines", city],
    queryFn: () => fetchDeadlines(city),
    enabled: !!user,
  });

  const permits = permitsData?.permits ?? [];
  const deadlines = deadlinesData?.upcomingDeadlines ?? [];
  const checks = getChecks();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">Compliance Checklist</h1>
          <p className="text-muted-foreground mt-1">
            Permit and compliance requirements for{" "}
            <span className="font-semibold capitalize">{businessType}</span> businesses in{" "}
            <span className="font-semibold capitalize">{city}</span>.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            This is general guidance only, scoped to Houston and Austin, TX. Requirements change — always verify with the relevant agency before making business decisions.
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

        <div className="bg-white border border-border rounded-2xl p-5">
          <h2 className="font-bold text-foreground mb-4">Permit Checklist</h2>
          {permitsLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : permits.length === 0 ? (
            <p className="text-muted-foreground text-sm">No permits found for your profile. Update your business type in Settings.</p>
          ) : (
            <div className="space-y-4">
              {permits.map((permit: any, i: number) => {
                const key = `permit_${i}_${permit.name}`;
                const checked = checks[key] ?? false;
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border transition-colors ${checked ? "border-emerald-200 bg-emerald-50" : "border-border"}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => {
                          saveCheck(key, !checked);
                          window.dispatchEvent(new Event("storage"));
                        }}
                        className="mt-0.5 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                      >
                        {checked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`font-semibold text-sm ${checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {permit.name}
                          </h3>
                          {permit.link && (
                            <a
                              href={permit.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 text-xs"
                            >
                              <ExternalLink className="w-3 h-3" /> Link
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className="font-medium">Required:</span> {permit.required}
                          {permit.cost ? ` · Cost: ${permit.cost}` : ""}
                        </p>
                        {(permit.details || permit.notes) && (
                          <p className="text-xs text-muted-foreground mt-1">{permit.details || permit.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <DisclaimerBanner />
    </Layout>
  );
}
