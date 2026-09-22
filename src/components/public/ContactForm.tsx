"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Contact form. The backend has no contact endpoint, so this composes a
 * `mailto:` — functional with no server. Swap `onSubmit` for an API call if a
 * `/contact` endpoint is added later.
 */
export function ContactForm({ to }: { to: string }) {
  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });

  function set<K extends keyof typeof values>(key: K, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = values.subject || `Message from ${values.name || "a reader"}`;
    const body = `Name: ${values.name}\nEmail: ${values.email}\n\n${values.message}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    toast.success("Opening your email app…");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={values.subject}
          onChange={(e) => set("subject", e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          required
          rows={6}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          className="flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
        />
      </div>
      <Button type="submit" size="lg">
        <Send className="h-4 w-4" />
        Send message
      </Button>
    </form>
  );
}
