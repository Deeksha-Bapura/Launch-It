import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { FileText, MessageSquare, DollarSign, BarChart3, CheckSquare, Share2, Calendar, AlertCircle } from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";

const BASE = "/api";

function fetchDocuments() {
  return fetch(`${BASE}/documents`, { credentials: "include" }).then((r) => r.json());
}

function fetchDeadlines(city: string) {
  return fetch(`${BASE}/compliance/deadlines?city=${encodeURIComponent(city)}`, { credentials: "include" }).then((r) =>
    r.ok ? r.json() : { upcomingDeadlines: [] }
  );
}

const DOC_TYPE_ICONS: Record<string, any> = {
  invoice: FileText,
  profit_loss: BarChart3,
  pricing: DollarSign,
  social_post: Share2,
};

export default function Dashboard() {
  const { user } = useAuth();

  const city = user?.state?.toLowerCase().includes("tx") || user?.state === "TX" ? "houston" : "houston";
  const daysSince = user?.createdAt
    ? differenceInDays(new Date(), parseISO(user.createdAt))
    : 0;

  const { data: docsData } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
    enabled: !!user,
  });

  const { data: deadlinesData } = useQuery({
    queryKey: ["deadlines", city],
    queryFn: () => fetchDeadlines(city),
    enabled: !!user,
  });

  const recentDocs = (docsData?.documents ?? []).slice(-3).reverse();
  const upcomingDeadlines = (deadlinesData?.upcomingDeadlines ?? []).slice(0, 3);

  const quickActions = [
    { label: "Start a Chat", href: "/chat", icon: MessageSquare, color: "bg-primary/10 text-primary" },
    { label: "Track Income", href: "/tracker", icon: DollarSign, color: "bg-emerald-100 text-emerald-600" },
    { label: "View Reports", href: "/report", icon: BarChart3, color: "bg-blue-100 text-blue-600" },
    { label: "Compliance", href: "/compliance", icon: CheckSquare, color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-muted-foreground mt-1">Here's your business at a glance.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground font-medium">Business</p>
            <p className="font-bold text-foreground text-sm mt-1 truncate">{user?.businessName ?? "Not set"}</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground font-medium">Type</p>
            <p className="font-bold text-foreground text-sm mt-1 capitalize">{user?.businessType ?? "Unknown"}</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground font-medium">State</p>
            <p className="font-bold text-foreground text-sm mt-1">{user?.state ?? "Not set"}</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground font-medium">Days Since Joining</p>
            <p className="font-bold text-foreground text-sm mt-1">{daysSince} days</p>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-lg text-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-border rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all text-center"
              >
                <div className={`p-3 rounded-xl ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-foreground">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">Recent Documents</h2>
              <Link href="/documents" className="text-xs text-primary font-semibold hover:underline">View all</Link>
            </div>
            {recentDocs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No documents yet. Start a chat to generate some!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocs.map((doc: any) => {
                  const Icon = DOC_TYPE_ICONS[doc.type] ?? FileText;
                  return (
                    <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                      <div className="bg-muted p-2 rounded-lg">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{format(parseISO(doc.createdAt), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">Upcoming Deadlines</h2>
              <Link href="/compliance" className="text-xs text-primary font-semibold hover:underline">View all</Link>
            </div>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No upcoming deadlines.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((d: any, i: number) => {
                  const daysLeft = differenceInDays(parseISO(d.date), new Date());
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                      <div className={`p-2 rounded-lg ${daysLeft < 7 ? "bg-red-100" : "bg-amber-100"}`}>
                        <AlertCircle className={`w-4 h-4 ${daysLeft < 7 ? "text-red-600" : "text-amber-600"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{d.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(d.date), "MMM d, yyyy")} · {daysLeft > 0 ? `${daysLeft} days left` : "Today"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
