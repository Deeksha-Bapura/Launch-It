import { motion } from "framer-motion";
import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ChatMessageRole } from "@workspace/api-client-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MessageBubbleProps {
  role: ChatMessageRole;
  content: string;
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
          {/* Simple markdown parsing for bold text */}
          {content.split('\n').map((line, i) => (
            <p key={i} className={cn(i > 0 && "mt-2", "whitespace-pre-wrap")}>
              {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </p>
          ))}
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
