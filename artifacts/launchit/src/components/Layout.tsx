import { ReactNode } from "react";
import { NavBar } from "./NavBar";
import { DisclaimerBanner } from "./DisclaimerBanner";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full font-sans bg-background">
      <NavBar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <DisclaimerBanner />
    </div>
  );
}
