import { Link, useLocation } from "wouter";
import { Rocket, FileText, MessageSquare } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function NavBar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2 group transition-transform hover:-translate-y-0.5"
        >
          <div className="bg-primary/10 p-2 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <Rocket className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl text-foreground tracking-tight">
            LaunchIt
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link 
            href="/chat"
            className={cn(
              "flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
              location === "/chat" 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </Link>
          <Link 
            href="/documents"
            className={cn(
              "flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
              location === "/documents" 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Documents</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
