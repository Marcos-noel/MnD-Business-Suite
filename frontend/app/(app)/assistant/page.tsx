"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

type Msg = { role: "user" | "assistant"; content: string };

// Typewriter effect component
function TypewriterEffect({ text, className }: { text: string; className?: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);
  
  useEffect(() => {
    // Reset when text changes
    indexRef.current = 0;
    setDisplayedText("");
    
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text[indexRef.current]);
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, 20); // Speed of typing
    
    return () => clearInterval(interval);
  }, [text]);
  
  return <span className={className}>{displayedText}</span>;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Ask me about profit, low stock, pipeline, or shipments." }
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!text.trim()) return;
    const msg = text.trim();
    setText("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await api<{ reply: string }>("assistant/chat", { method: "POST", body: JSON.stringify({ message: msg }) });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      <div>
        <div className="text-lg font-semibold">AI Assistant</div>
        <div className="text-sm text-[hsl(var(--c-muted-2))]">Structured mock logic, ready for ML/OpenAI provider integration.</div>
      </div>

      {error && <Card className="border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-3 p-2">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  "max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm " +
                  (m.role === "user"
                    ? "bg-[hsl(var(--accent))] text-black"
                    : "bg-slate-800 text-white dark:bg-slate-800")
                }
              >
                {m.role === "assistant" && i === messages.length - 1 && loading ? (
                  <TypewriterEffect text={m.content} />
                ) : (
                  m.content
                )}
              </div>
            </motion.div>
          ))}
          {loading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="text-xs text-[hsl(var(--c-muted-2))]">Thinking…</div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card>

      <Card className="shrink-0">
        <div className="flex gap-2">
          <Input
            placeholder="Type a question…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void send();
            }}
            className="flex-1"
          />
          <Button onClick={send} disabled={loading}>
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
}
