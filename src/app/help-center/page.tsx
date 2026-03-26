import * as React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Card } from "@/components/ui/Card";

export default function HelpCenterPage() {
  const faqs = [
    {
      q: "How do I create my first Lynx page?",
      a: "Open the dashboard, choose a template category, set a handle, and save. You can edit blocks and publish instantly.",
    },
    {
      q: "Can clients access a Project Portal without an account?",
      a: "Yes. Use the invitation link or PIN. The portal gate sets a secure cookie for the client.",
    },
    {
      q: "How do I update my brand logo and colors?",
      a: "Go to Branding in the dashboard and upload your logo, set theme colors, and preview changes live.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight">Help Center</h1>
            <p className="text-text-secondary text-lg font-medium">Answers to common questions and quick guidance.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {faqs.map((f, i) => (
              <Card key={i} className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-3">
                <h3 className="text-lg font-bold text-text-primary">{f.q}</h3>
                <p className="text-sm text-text-secondary">{f.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
