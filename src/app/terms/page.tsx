import * as React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Card } from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="py-24">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight">Terms of Service</h1>
            <p className="text-text-secondary text-lg font-medium">Please read these terms carefully.</p>
          </div>
          <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
            <p className="text-sm text-text-secondary">By using Stickylynx, you agree to follow applicable laws and our usage guidelines. You retain ownership of content you create; you grant us permission to host and display it.</p>
            <p className="text-sm text-text-secondary">We reserve the right to suspend accounts for abuse or violations. Service features may change; we’ll communicate significant updates.</p>
          </Card>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
