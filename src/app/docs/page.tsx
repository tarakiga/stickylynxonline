import * as React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Card } from "@/components/ui/Card";

export default function DocsPage() {
  const sections = [
    { title: "Getting Started", text: "Create an account, pick a category (EPK, Menu, Portal), set a handle, and publish." },
    { title: "Editor Basics", text: "Each page has blocks. Edit content inline, reorder, and style using the design system." },
    { title: "Publishing", text: "Pages are live at your handle. Share the link or embed in your website and socials." },
  ];
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight">Documentation</h1>
            <p className="text-text-secondary text-lg font-medium">Concise guides to help you build faster.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((s, i) => (
              <Card key={i} className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-3">
                <h3 className="text-lg font-bold text-text-primary">{s.title}</h3>
                <p className="text-sm text-text-secondary">{s.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
