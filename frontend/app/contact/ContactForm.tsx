"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { submitContactRequest } from "@/lib/marketing";

const topics = ["Sales", "Support", "Partnerships", "Press", "Other"];

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await submitContactRequest(payload);
      setStatus("success");
      setMessage(`Message received! Reference: ${res.reference_id}`);
      event.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setMessage("We couldn’t send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-semibold text-[hsl(var(--c-text))]">Contact MnD</h2>
      <p className="mt-2 text-sm text-[hsl(var(--c-text-secondary))]">
        We respond within one business day.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="name" required placeholder="Full name" className="input" />
          <input name="email" type="email" required placeholder="Work email" className="input" />
          <input name="company" required placeholder="Company name" className="input" />
          <input name="phone" placeholder="Phone (optional)" className="input" />
        </div>
        <select name="topic" required className="input">
          <option value="">Topic</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        <textarea
          name="message"
          rows={5}
          required
          placeholder="How can we help?"
          className="input"
        />

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </Button>

        {status !== "idle" && (
          <p className={`text-sm ${status === "success" ? "text-emerald-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </form>
    </Card>
  );
}
