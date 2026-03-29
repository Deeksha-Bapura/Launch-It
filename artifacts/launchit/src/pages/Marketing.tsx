import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Copy, Instagram, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";

const BASE = "/api";

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
};

function CaptionTab({ businessType, location }: { businessType: string; location: string }) {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [bt, setBt] = useState(businessType || "");
  const [captions, setCaptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/marketing/caption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType: bt || "small business", description, location }),
        credentials: "include",
      });
      const data = await res.json();
      setCaptions(data.captions ?? []);
    } catch {
      toast({ title: "Error generating captions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, hashtags: string[]) => {
    const full = `${text}\n\n${hashtags.map((h) => `#${h}`).join(" ")}`;
    navigator.clipboard.writeText(full);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Business Type</label>
          <input
            type="text"
            value={bt}
            onChange={(e) => setBt(e.target.value)}
            placeholder="e.g. home baker, nail tech, cleaning service"
            className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Post Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this post about? e.g. just finished a birthday cake order, proud of how it turned out"
            rows={3}
            className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <button
          onClick={generate}
          disabled={loading || !description.trim()}
          className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate 3 Captions"}
        </button>
      </div>

      {captions.length > 0 && (
        <div className="space-y-3">
          {captions.map((cap: any, i: number) => (
            <div key={i} className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-foreground flex-1">{cap.text}</p>
                <button
                  onClick={() => copy(cap.text, cap.hashtags)}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {cap.hashtags?.map((h: string, j: number) => (
                  <span key={j} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">#{h}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformTab({ businessType, location }: { businessType: string; location: string }) {
  const { toast } = useToast();
  const [bt, setBt] = useState(businessType || "");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const recommend = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/marketing/platform-recommendation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType: bt || "small business", targetAudience: audience, contentGoal: goal, location }),
        credentials: "include",
      });
      const data = await res.json();
      setPlatforms(data.platforms ?? []);
    } catch {
      toast({ title: "Error getting recommendations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Business Type</label>
          <input
            type="text"
            value={bt}
            onChange={(e) => setBt(e.target.value)}
            placeholder="e.g. home baker"
            className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Target Audience</label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. local families, young professionals, pet owners"
            className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Main Goal</label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. get new customers, showcase my work, build trust"
            className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={recommend}
          disabled={loading || !audience.trim() || !goal.trim()}
          className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Get Recommendations"}
        </button>
      </div>

      {platforms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {platforms.map((p: any, i: number) => {
            const Icon = PLATFORM_ICONS[p.icon?.toLowerCase()] ?? Instagram;
            return (
              <div key={i} className="bg-white border border-border rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-foreground">{p.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{p.reason}</p>
                <ul className="space-y-1">
                  {p.tips?.map((tip: string, j: number) => (
                    <li key={j} className="text-xs text-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CalendarTab({ businessType, businessName, location }: { businessType: string; businessName: string; location: string }) {
  const { toast } = useToast();
  const [bt, setBt] = useState(businessType || "");
  const [bn, setBn] = useState(businessName || "");
  const [focus, setFocus] = useState("");
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/marketing/content-calendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType: bt || "small business", businessName: bn, focus, location }),
        credentials: "include",
      });
      const data = await res.json();
      setDays(data.days ?? []);
    } catch {
      toast({ title: "Error generating calendar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const TYPE_COLORS: Record<string, string> = {
    Photo: "bg-blue-100 text-blue-700",
    Video: "bg-purple-100 text-purple-700",
    Story: "bg-pink-100 text-pink-700",
    Reel: "bg-orange-100 text-orange-700",
    "Blog Post": "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground">Business Type</label>
            <input
              type="text"
              value={bt}
              onChange={(e) => setBt(e.target.value)}
              placeholder="e.g. nail tech"
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Business Name (optional)</label>
            <input
              type="text"
              value={bn}
              onChange={(e) => setBn(e.target.value)}
              placeholder="e.g. Nails by Maria"
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Focus (optional)</label>
          <input
            type="text"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g. summer promotions, building trust, showcasing transformations"
            className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={generate}
          disabled={loading || !bt.trim()}
          className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Building..." : "Generate Weekly Calendar"}
        </button>
      </div>

      {days.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {days.map((d: any, i: number) => {
            const colorClass = TYPE_COLORS[d.type] ?? "bg-muted text-muted-foreground";
            return (
              <div key={i} className="bg-white border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-foreground text-sm">{d.day}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>{d.type}</span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">{d.theme}</p>
                <p className="text-sm text-foreground">{d.contentIdea}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Marketing() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"caption" | "platform" | "calendar">("caption");
  const location = user?.state ?? "";

  const tabs = [
    { id: "caption" as const, label: "Caption Generator" },
    { id: "platform" as const, label: "Platform Recommender" },
    { id: "calendar" as const, label: "Content Calendar" },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">Marketing Engine</h1>
          <p className="text-muted-foreground mt-1">Tools to grow your online presence and attract customers.</p>
        </div>

        <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "caption" && <CaptionTab businessType={user?.businessType ?? ""} location={location} />}
        {tab === "platform" && <PlatformTab businessType={user?.businessType ?? ""} location={location} />}
        {tab === "calendar" && <CalendarTab businessType={user?.businessType ?? ""} businessName={user?.businessName ?? ""} location={location} />}
      </div>
    </Layout>
  );
}
