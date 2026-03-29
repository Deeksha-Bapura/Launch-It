import { Link, useLocation } from "wouter";
import { Rocket, FileText, MessageSquare, LayoutDashboard, BarChart3, Megaphone, Shield, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/tracker", label: "Tracker", icon: BarChart3 },
  { href: "/report", label: "Report", icon: BarChart3 },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
  { href: "/compliance", label: "Compliance", icon: Shield },
  { href: "/documents", label: "Documents", icon: FileText },
];

const BOTTOM_TAB_LINKS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/tracker", label: "Tracker", icon: BarChart3 },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
  { href: "/documents", label: "Docs", icon: FileText },
];

function AvatarDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
          {initials}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-border rounded-2xl shadow-lg py-1.5 z-50">
          <div className="px-4 py-2 border-b border-border mb-1">
            <p className="font-semibold text-sm text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <User className="w-4 h-4 text-muted-foreground" /> Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="w-4 h-4 text-muted-foreground" /> Settings
          </Link>
          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function NavBar() {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2 group transition-transform hover:-translate-y-0.5 shrink-0"
          >
            <div className="bg-primary/10 p-2 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <Rocket className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-tight">LaunchIt</span>
          </Link>

          {!isLoading && user && (
            <div className="hidden md:flex items-center gap-0.5 overflow-x-auto">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap",
                    location === href
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isLoading && !user && (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-primary text-white hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20 hover:shadow-lg"
              >
                Sign In
              </Link>
            )}
            {!isLoading && user && <AvatarDropdown />}
          </div>
        </div>
      </nav>

      {!isLoading && user && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-border">
          <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
            {BOTTOM_TAB_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all",
                  location === href ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", location === href && "text-primary")} />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
