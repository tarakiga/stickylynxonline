import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function LandingPricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      limits: "Up to 2 pages (Lynx), 1 Food Menu, basic templates only",
      features: ["Core templates", "Basic analytics (views)", "Menu QR codes", "Email notifications for comments"],
    },
    {
      name: "Creator",
      price: "$12 / month",
      limits: "Up to 5 pages (Lynx), 2 Food Menus, standard templates",
      features: ["Everything in Starter", "Custom branding (logo, colors)", "Advanced Food Menu: multi-location, multi-contact, product variations"],
    },
    {
      name: "Studio",
      price: "$29 / month",
      limits: "Up to 15 pages, unlimited Food Menus",
      features: ["Everything in Creator", "Advanced analytics (per-page & per-template)", "Exportable data", "Higher email notification limits"],
    },
  ];

  return (
    <section id="pricing" className="bg-background py-24">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight">OnePage Studio Pricing</h2>
          <p className="text-text-secondary text-lg font-medium">Choose a plan that matches your growth.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((p, i) => (
            <Card key={i} className="rounded-3xl border border-divider bg-surface p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-primary">{p.name}</h3>
                {p.name === "Creator" && <Badge variant="neutral">Popular</Badge>}
              </div>
              <p className="text-3xl font-black text-text-primary tracking-tight">{p.price}</p>
              <p className="text-sm text-text-secondary font-medium">{p.limits}</p>
              <ul className="space-y-2">
                {p.features.map((f, j) => (
                  <li key={j} className="text-sm text-text-secondary">• {f}</li>
                ))}
              </ul>
              <Button variant="primary" className="w-full font-bold">Get Started</Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
