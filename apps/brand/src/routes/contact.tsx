import { useState, type FormEvent } from "react";

import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Hezaerd" },
      {
        name: "description",
        content: "Start a project inquiry with Hezaerd. Email fallback available.",
      },
    ],
    links: [{ rel: "canonical", href: "https://hezaerd.com/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const budget = String(form.get("budget") ?? "");
    const message = String(form.get("message") ?? "");

    const subject = encodeURIComponent(`Project inquiry from ${name}`);
    const body = encodeURIComponent(
      [`Name: ${name}`, `Email: ${email}`, `Budget: ${budget}`, "", message].join("\n"),
    );

    window.location.href = `mailto:${site.contactEmail}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Contact</h1>
      <p className="text-muted-foreground mt-4 text-lg">
        Share enough context for a useful first reply. Prefer email?{" "}
        <a href={`mailto:${site.contactEmail}`} className="text-primary">
          {site.contactEmail}
        </a>
      </p>

      <form onSubmit={onSubmit} className="mt-12 space-y-6">
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input
            name="name"
            required
            aria-label="Name"
            className="border-border bg-muted mt-2 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            aria-label="Email"
            className="border-border bg-muted mt-2 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Budget range</span>
          <select
            name="budget"
            aria-label="Budget range"
            className="border-border bg-muted mt-2 w-full rounded-md border px-3 py-2"
            defaultValue=""
          >
            <option value="" disabled>
              Select one
            </option>
            <option value="under-5k">Under $5k</option>
            <option value="5k-15k">$5k – $15k</option>
            <option value="15k-40k">$15k – $40k</option>
            <option value="40k-plus">$40k+</option>
            <option value="retainer">Retainer / ongoing</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Project details</span>
          <textarea
            name="message"
            required
            rows={6}
            aria-label="Project details"
            className="border-border bg-muted mt-2 w-full rounded-md border px-3 py-2"
            placeholder="What are you building, timeline, and what success looks like?"
          />
        </label>
        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-3 text-sm font-medium"
        >
          Send inquiry
        </button>
        {submitted ? (
          <p className="text-muted-foreground text-sm">
            Your mail client should open with a drafted message. If it does not, email{" "}
            {site.contactEmail} directly.
          </p>
        ) : null}
      </form>
    </main>
  );
}
