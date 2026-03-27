"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

type Msg = { role: "user" | "assistant"; content: string };

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Ask me about profit, low stock, pipeline, or shipments." }
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">AI Assistant</div>
        <div className="text-sm text-white/50">Structured mock logic, ready for ML/OpenAI provider integration.</div>
      </div>

      {error && <Card className="border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card className="min-h-[420px]">
        <div className="space-y-3">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm " +
                  (m.role === "user"
                    ? "bg-[hsl(var(--accent))] text-black"
                    : "glass text-white/90")
                }
              >
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="text-xs text-white/50">Thinking…</div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex gap-2">
          <Input
            placeholder="Type a question…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void send();
            }}
          />
          <Button onClick={send} disabled={loading}>
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
}

