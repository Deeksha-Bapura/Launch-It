import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ClipboardList, ArrowLeft, FileText, BarChart3, DollarSign, Share2, X, Printer } from "lucide-react";
import { Layout } from "@/components/Layout";
import { format, parseISO } from "date-fns";

const BASE = "https://launch-it-cnhy.onrender.com/api";

interface DbDocument {
  id: number;
  type: string;
  title: string;
  content: Record<string, any>;
  createdAt: string;
}

const DOC_TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  invoice: { icon: FileText, color: "bg-primary/10 text-primary" },
  profit_loss: { icon: BarChart3, color: "bg-emerald-100 text-emerald-600" },
  pricing: { icon: DollarSign, color: "bg-blue-100 text-blue-600" },
  social_post: { icon: Share2, color: "bg-purple-100 text-purple-600" },
};

function DocumentContentView({ doc }: { doc: DbDocument }) {
  const content = doc.content;

  const renderValue = (val: any, depth = 0): React.ReactNode => {
    if (val === null || val === undefined) return null;
    if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
      return <span className="text-foreground">{String(val)}</span>;
    }
    if (Array.isArray(val)) {
      return (
        <ul className="list-disc pl-4 space-y-1">
          {val.map((item, i) => (
            <li key={i} className="text-sm">{renderValue(item, depth + 1)}</li>
          ))}
        </ul>
      );
    }
    if (typeof val === "object") {
      return (
        <div className={`space-y-2 ${depth > 0 ? "pl-4 border-l border-border" : ""}`}>
          {Object.entries(val).map(([k, v]) => (
            <div key={k}>
              <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">{k.replace(/_/g, " ")}</span>
              <div className="mt-0.5 text-sm">{renderValue(v, depth + 1)}</div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return <div className="space-y-4">{renderValue(content)}</div>;
}

function DocumentModal({ doc, onClose }: { doc: DbDocument; onClose: () => void }) {
  const cfg = DOC_TYPE_CONFIG[doc.type] ?? { icon: FileText, color: "bg-muted text-muted-foreground" };
  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${cfg.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{doc.title}</h3>
              <p className="text-xs text-muted-foreground">{format(parseISO(doc.createdAt), "MMMM d, yyyy")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              PDF
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <DocumentContentView doc={doc} />
        </div>
      </div>
    </div>
  );
}

export default function Documents() {
  const [selectedDoc, setSelectedDoc] = useState<DbDocument | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => fetch(`${BASE}/documents`, { credentials: "include" }).then((r) => r.json()),
  });

  const documents: DbDocument[] = (data?.documents ?? []).slice().reverse();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col">
        <div className="mb-8">
          <Link href="/chat" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Your Documents</h1>
          <p className="text-muted-foreground mt-2 text-lg">All generated documents saved to your account.</p>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading documents...</p>
        ) : documents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4 bg-white rounded-3xl border border-border border-dashed">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <ClipboardList className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Your documents will show up here</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Once we figure out what you need in the chat, you can generate professional invoices, trackers, and more.
            </p>
            <Link
              href="/chat"
              className="bg-primary text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Start chatting
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const cfg = DOC_TYPE_CONFIG[doc.type] ?? { icon: FileText, color: "bg-muted text-muted-foreground" };
              const Icon = cfg.icon;
              return (
                <div key={doc.id} className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${cfg.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{format(parseISO(doc.createdAt), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="mt-auto w-full py-2 border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    View
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedDoc && <DocumentModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
    </Layout>
  );
}
