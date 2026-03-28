import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div className="bg-white border-t border-border shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)] p-4 sm:p-6 w-full">
      <div className="max-w-4xl mx-auto flex items-end gap-3 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your message... (Shift+Enter for new line)"
          className="w-full max-h-[120px] bg-muted/50 border border-border rounded-2xl px-5 py-3.5 text-[15px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all resize-none disabled:opacity-50"
          disabled={disabled}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className={cn(
            "h-[52px] w-[52px] shrink-0 rounded-2xl flex items-center justify-center transition-all duration-300",
            disabled || !input.trim()
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
          )}
        >
          {disabled ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <SendHorizontal className="w-6 h-6 ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
