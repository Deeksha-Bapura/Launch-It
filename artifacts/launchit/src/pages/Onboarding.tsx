import { useState } from "react";
import { useLocation } from "wouter";
import { Rocket, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

function getApiBase() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/api`;
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, refetchUser } = useAuth();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [state, setState] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const saveStep1 = async () => {
    if (!businessName.trim() || !state) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ businessName: businessName.trim(), state }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setStep(2);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveStep2 = async () => {
    if (!businessDescription.trim()) {
      setError("Please add a short description.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ businessDescription: businessDescription.trim() }),
      });
      if (!res.ok) throw new Error("Failed to save");
      await refetchUser();
      setStep(3);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Rocket className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">LaunchIt</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    s < step
                      ? "bg-primary text-white"
                      : s === step
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-0.5 rounded-full ${s < step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-border shadow-sm p-8">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Tell us about your business</h2>
                <p className="text-muted-foreground mt-1">We'll use this to personalize your experience.</p>
              </div>
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl font-medium">{error}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Business name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Maria's Baked Goods"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
                >
                  <option value="">Select your state…</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={saveStep1}
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? "Saving..." : <>Continue <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">What do you do?</h2>
                <p className="text-muted-foreground mt-1">One or two sentences is perfect.</p>
              </div>
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl font-medium">{error}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Business description</label>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  maxLength={200}
                  rows={4}
                  placeholder="I bake cakes and sell them to neighbors and at local markets."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{businessDescription.length}/200</p>
              </div>
              <button
                onClick={saveStep2}
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? "Saving..." : <>Continue <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Welcome, {user?.name?.split(" ")[0]}!
                </h2>
                <p className="text-muted-foreground mt-2">
                  You're all set up in <strong>{user?.state}</strong>. Let's get your business official.
                </p>
              </div>
              <button
                onClick={handleFinish}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-95 flex items-center justify-center gap-2"
              >
                Let's go <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
