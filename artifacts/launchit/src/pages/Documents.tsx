import { Link } from "wouter";
import { ClipboardList, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/Layout";
import { DocumentCard } from "@/components/DocumentCard";
import { useAppContext } from "@/context/AppContext";

export default function Documents() {
  const { documents } = useAppContext();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col">
        <div className="mb-8">
          <Link href="/chat" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Your Documents</h1>
          <p className="text-muted-foreground mt-2 text-lg">Everything generated in your session. Download or copy anything you need.</p>
        </div>

        {documents.length === 0 ? (
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {documents.map((doc, idx) => (
              <DocumentCard key={idx} document={doc} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
