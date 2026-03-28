import { Copy, Download, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { DocumentResponseDocument } from "@workspace/api-client-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function DocumentCard({ document }: { document: DocumentResponseDocument }) {
  const [copied, setCopied] = useState(false);
  const title = (document.title as string) || "Business Document";
  const type = (document.type as string) || "general";
  const content = document.content as any;
  const tip = document.tip as string;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(document, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(document, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (!content) return <pre className="text-xs text-muted-foreground overflow-auto p-4 bg-muted/30 rounded-xl">{JSON.stringify(document, null, 2)}</pre>;

    if (type === "invoice") {
      return (
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm text-sm">
          <div className="flex justify-between border-b pb-4 mb-4">
            <div>
              <h4 className="font-bold text-lg text-foreground">{content.businessName || "Your Business"}</h4>
              <p className="text-muted-foreground">{content.date || new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <h4 className="font-bold text-primary">INVOICE</h4>
              <p className="text-muted-foreground">#{Math.floor(Math.random()*1000)}</p>
            </div>
          </div>
          <table className="w-full text-left mb-4">
            <thead>
              <tr className="text-muted-foreground border-b">
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(content.items || []).map((item: any, i: number) => (
                <tr key={i} className="border-b border-muted">
                  <td className="py-3">{item.description}</td>
                  <td className="py-3 text-right">${item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end text-base font-bold">
            <span>Total: ${content.total || "0.00"}</span>
          </div>
        </div>
      );
    }

    if (type === "profit_loss") {
      return (
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm text-sm">
          <h4 className="font-bold text-center mb-4 pb-2 border-b">Profit & Loss Statement</h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold text-emerald-600 mb-2">Revenues</h5>
              {(content.revenues || []).map((r: any, i: number) => (
                <div key={i} className="flex justify-between text-muted-foreground">
                  <span>{r.description}</span>
                  <span>+${r.amount}</span>
                </div>
              ))}
            </div>
            <div>
              <h5 className="font-semibold text-rose-600 mb-2">Expenses</h5>
              {(content.expenses || []).map((e: any, i: number) => (
                <div key={i} className="flex justify-between text-muted-foreground">
                  <span>{e.description}</span>
                  <span>-${e.amount}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold pt-3 border-t text-base">
              <span>Net Income</span>
              <span className={content.netIncome >= 0 ? "text-emerald-600" : "text-rose-600"}>
                ${content.netIncome}
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (type === "pricing") {
      return (
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm text-sm space-y-4">
          {(content.steps || []).map((step: any, i: number) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <div>
                <h5 className="font-bold mb-1">{step.label}</h5>
                <p className="text-muted-foreground">{step.calculation}</p>
              </div>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t text-center">
            <span className="font-bold text-lg text-primary">Recommended Price: {content.recommendedPrice}</span>
          </div>
        </div>
      );
    }

    if (type === "social_post") {
      return (
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm text-sm">
          <div className="flex bg-muted/50 border-b">
            {Object.keys(content).map((platform) => (
              <div key={platform} className="flex-1 py-2 px-3 text-center text-xs font-bold uppercase text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors">
                {platform}
              </div>
            ))}
          </div>
          <div className="p-5">
            <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
              {content[Object.keys(content)[0]]}
            </p>
          </div>
        </div>
      );
    }

    // Fallback render
    return <pre className="text-xs text-muted-foreground overflow-auto p-4 bg-muted/30 rounded-xl">{JSON.stringify(content, null, 2)}</pre>;
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-border overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300 group">
      <div className="p-5 border-b border-border flex items-center gap-3 bg-muted/20">
        <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
          <FileText className="w-5 h-5" />
        </div>
        <h3 className="font-display font-bold text-lg">{title}</h3>
      </div>
      
      <div className="p-5 bg-muted/5 flex-1">
        {renderContent()}
      </div>

      <div className="p-5 bg-white border-t border-border mt-auto">
        {tip && (
          <p className="text-sm text-muted-foreground italic mb-4 flex gap-2">
            <span className="text-primary font-bold not-italic">💡</span> {tip}
          </p>
        )}
        <div className="flex gap-3">
          <button 
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm border-2 border-border text-foreground hover:bg-muted hover:border-muted-foreground/20 transition-all active:scale-95"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button 
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 active:translate-y-0"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
