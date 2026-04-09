"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { submitDemoRequest } from "@/lib/marketing";

const companySizes = ["1-10", "11-50", "51-200", "201-1000", "1000+"];
const timeframes = ["Immediate", "This quarter", "Next 3-6 months", "6-12 months"];
const interestAreas = ["Full Suite", "Operations", "Revenue", "Global Trade", "AI & Analytics"];

export default function DemoForm() {
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
      const res = await submitDemoRequest(payload);
      setStatus("success");
      setMessage(`Thanks! Your demo request is confirmed. Reference: ${res.reference_id}`);
      event.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setMessage("We couldn’t submit your demo request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-semibold text-[hsl(var(--c-text))]">Request a production demo</h2>
      <p className="mt-2 text-sm text-[hsl(var(--c-text-secondary))]">
        Tell us about your team and we’ll tailor a walkthrough in under 48 hours.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="name" required placeholder="Full name" className="input" />
          <input name="email" type="email" required placeholder="Work email" className="input" />
          <input name="company" required placeholder="Company name" className="input" />
          <input name="role" required placeholder="Role / Title" className="input" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <select name="company_size" required className="input">
            <option value="">Company size</option>
            {companySizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <input name="phone" placeholder="Phone (optional)" className="input" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input name="country" required placeholder="Country" className="input" />
          <select name="preferred_timeframe" required className="input">
            <option value="">Preferred timeframe</option>
            {timeframes.map((timeframe) => (
              <option key={timeframe} value={timeframe}>
                {timeframe}
              </option>
            ))}
          </select>
        </div>

        <select name="interest_area" required className="input">
          <option value="">Primary interest</option>
          {interestAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>

        <textarea
          name="notes"
          rows={4}
          placeholder="What would you like to see in the demo?"
          className="input"
        />

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Submitting..." : "Request Demo"}
        </Button>

        {status !== "idle" && (
          <p
            className={`text-sm ${
              status === "success" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </Card>
  );
}
