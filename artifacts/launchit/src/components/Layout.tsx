import { ReactNode } from "react";
import { NavBar } from "./NavBar";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { useAuth } from "@/context/AuthContext";

export function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <div className={`min-h-screen flex flex-col w-full font-sans bg-background ${user ? "pb-16 md:pb-0" : ""}`}>
      <NavBar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <DisclaimerBanner />
    </div>
  );
}
