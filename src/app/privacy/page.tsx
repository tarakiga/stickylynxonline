import * as React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Card } from "@/components/ui/Card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="py-24">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight">Privacy Policy</h1>
            <p className="text-text-secondary text-lg font-medium">Your data is respected and protected. For support, contact <a href="mailto:support@stickylynx.online" className="text-primary font-bold">support@stickylynx.online</a>.</p>
          </div>
          <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
            <p className="text-sm text-text-secondary">We collect minimal data to run the platform, such as account information and page content you create. We do not sell or share personal data with third parties without your consent.</p>
            <p className="text-sm text-text-secondary">You can request data export or deletion by contacting support. Security measures are in place to safeguard your information.</p>
          </Card>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
