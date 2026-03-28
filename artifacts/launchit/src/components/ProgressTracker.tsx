import { Check } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STEPS = [
  "Tell us what you do",
  "Understand your permits",
  "Register your business",
  "Track your money",
  "Stay compliant",
];

export function ProgressTracker({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full py-6 px-4 bg-white border-b border-border shadow-sm shadow-black/5">
      <div className="max-w-4xl mx-auto">
        {/* Mobile View */}
        <div className="md:hidden flex flex-col items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-sm font-semibold text-primary text-center px-4 py-1.5 bg-primary/10 rounded-full">
            {STEPS[currentStep - 1]}
          </span>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-muted -z-10 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary -z-10 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>
          
          {STEPS.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300",
                    isCompleted 
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                      : isCurrent 
                        ? "bg-primary border-primary text-white shadow-md shadow-primary/30 ring-4 ring-primary/20" 
                        : "bg-white border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span 
                  className={cn(
                    "text-xs font-medium max-w-[120px] text-center transition-colors duration-300",
                    isCurrent ? "text-foreground font-bold" : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
