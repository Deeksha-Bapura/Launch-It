import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Shield, Search, FileText, MessageSquare } from "lucide-react";
import { Layout } from "@/components/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32 px-4 sm:px-6">
          {/* Abstract Background pattern placeholder */}
          <div className="absolute inset-0 -z-10 bg-[url('/images/hero-abstract.png')] bg-cover bg-center opacity-40 blur-sm mix-blend-multiply" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/90 to-background" />

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-8 animate-fade-in-up">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              Now live all over the US
            </div>
            
            <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1] animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              You're already running a business. Let's make it <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">official.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              LaunchIt helps people who are already making money — baking, cleaning, doing nails, fixing things — understand exactly what permits they need, how to register, and how to track their money. No jargon. No forms. Just a conversation.
            </p>
            
            <div className="flex flex-col items-center gap-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <Link 
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-3 bg-primary text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 active:translate-y-0 active:scale-95"
              >
                Start the conversation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm font-semibold text-muted-foreground">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-border">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  100% Free
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-border">
                  <Shield className="w-4 h-4 text-blue-500" />
                  No jargon
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-20 sm:py-32 px-4 sm:px-6 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-16">How LaunchIt works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                  <MessageSquare className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">1. Tell us what you do</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Just chat with us in plain English. Tell us what you sell or the services you provide from home.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-inner">
                  <Search className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">2. Get your exact permit list</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We'll figure out exactly which local and state permits you actually need, without the legal maze.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                  <FileText className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">3. Generate your first documents</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create professional invoices, profit & loss trackers, and pricing calculators with one click.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
