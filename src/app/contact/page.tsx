import * as React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="py-24">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight">Contact Us</h1>
            <p className="text-text-secondary text-lg font-medium">We’ll get back to you as soon as possible.</p>
          </div>
          <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input labelInside="Name" />
              <Input labelInside="Email" type="email" />
            </div>
            <Input labelInside="Subject" />
            <Textarea placeholder="Message" className="min-h-[140px]" />
            <Button variant="primary" className="w-full font-bold">Send Message</Button>
          </Card>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
