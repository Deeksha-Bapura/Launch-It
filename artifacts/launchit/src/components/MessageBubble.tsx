import { motion } from "framer-motion";
import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";
import type { ChatMessageRole } from "@workspace/api-client-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MessageBubbleProps {
  role: ChatMessageRole;
  content: string;
}

function renderInline(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detect markdown table (lines with |)
    if (line.trim().startsWith("|") && lines[i + 1]?.trim().startsWith("|---")) {
      const headerCells = line.trim().slice(1, -1).split("|").map((c) => c.trim());
      i += 2; // skip separator row
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i].trim().slice(1, -1).split("|").map((c) => c.trim()));
        i++;
      }
      elements.push(
        <div key={i} className="my-2 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {headerCells.map((h, hi) => (
                  <th key={hi} className="text-left py-1.5 px-3 bg-muted/50 font-semibold border-b border-border first:rounded-tl-lg last:rounded-tr-lg">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/50 last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-1.5 px-3">{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Regular line
    if (line.trim() !== "") {
      elements.push(
        <p key={i} className="mt-2 first:mt-0 whitespace-pre-wrap">
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return <>{elements}</>;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <img 
              src={`${import.meta.env.BASE_URL}images/avatar-assistant.png`}
              alt="LaunchIt Assistant" 
              className="w-5 h-5 rounded-full object-cover shadow-sm bg-primary/20"
            />
            <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">
              LaunchIt
            </span>
          </div>
        )}
        
        <div className={cn(
          "px-5 py-3.5 text-[15px] leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm shadow-primary/20 font-medium"
            : "bg-white border border-border text-foreground rounded-2xl rounded-bl-sm"
        )}>
          {content === "__pricing_loading__" ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm animate-pulse">Researching market rates in your area…</span>
            </div>
          ) : (
            renderContent(content)
          )}
        </div>
        
        <span className={cn(
          "text-[11px] text-muted-foreground/70 font-medium",
          isUser ? "mr-1" : "ml-1"
        )}>
          {format(new Date(), "h:mm a")}
        </span>
      </div>
    </motion.div>
  );
}
