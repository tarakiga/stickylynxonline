"use client";
import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { EditorPage } from "@/types/editor-page";
import { findEditorBlock } from "@/types/editor-page";

type PlatformMetric = {
  id: string;
  name: string;
  handle: string;
  url?: string;
  followers?: number;
  avgViews?: number;
  engagementRate?: number;
  notes?: string;
};

type ServiceItem = {
  id: string;
  name: string;
  description: string;
};

function ensureProtocol(url?: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") || url.startsWith("data:")) return url;
  return `https://${url}`;
}

type MediaKitHeroContent = {
  name?: string
  niche?: string
  primaryCta?: string
  profileImage?: string
}

type MediaKitBioContent = {
  text?: string
}

type MediaKitMetricsContent = {
  platforms?: PlatformMetric[]
}

type MediaKitServicesContent = {
  services?: ServiceItem[]
}

type MediaKitContactContent = {
  email?: string
  website?: string
}

export function MediaKitPublic({ page }: { page: EditorPage }) {
  const blocks = page.blocks || [];
  const hero = (findEditorBlock(blocks, "TEXT", "creator_hero")?.content || {}) as MediaKitHeroContent;
  const bio = (findEditorBlock(blocks, "TEXT", "creator_bio")?.content || {}) as MediaKitBioContent;
  const metrics = ((findEditorBlock(blocks, "GRID", "platform_metrics")?.content || {}) as MediaKitMetricsContent).platforms || [];
  const services = ((findEditorBlock(blocks, "GRID", "services")?.content || {}) as MediaKitServicesContent).services || [];
  const contact = (findEditorBlock(blocks, "CONTACT")?.content || {}) as MediaKitContactContent;

  const [showRequestModal, setShowRequestModal] = React.useState(false);
  const [reqName, setReqName] = React.useState("");
  const [reqEmail, setReqEmail] = React.useState("");
  const [reqBrand, setReqBrand] = React.useState("");
  const [reqBudget, setReqBudget] = React.useState("");
  const [reqTimeline, setReqTimeline] = React.useState("");
  const [reqMessage, setReqMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function submitRequest() {
    if (!reqEmail.trim() || !reqName.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/mediakit/${page.handle}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reqName.trim(),
          email: reqEmail.trim(),
          brand: reqBrand.trim(),
          budget: reqBudget.trim(),
          timeline: reqTimeline.trim(),
          message: reqMessage.trim(),
        }),
      });
      if (res.ok) {
        setSent(true);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-screen-md mx-auto min-h-screen bg-background text-text-primary px-4 py-8 pb-24 space-y-6">
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          Influencer Media Kit
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-surface border border-divider overflow-hidden shadow-sm flex items-center justify-center">
            {hero.profileImage ? (
              <img src={ensureProtocol(hero.profileImage)} alt={hero.name || page.title || "Profile"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 text-primary font-bold text-2xl flex items-center justify-center">
                {(hero.name || page.title || page.handle || "I").substring(0,1).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{hero.name || page.title || page.handle}</h1>
        </div>
        <p className="text-text-secondary font-semibold">{hero.niche || ""}</p>
        {(hero.primaryCta || contact.email) && (
          <div className="pt-2">
            <Button variant="primary" onClick={() => setShowRequestModal(true)} className="rounded-2xl px-6 py-2.5 text-sm font-bold shadow-sm border-none cursor-pointer">
              {hero.primaryCta || "Request a campaign"}
            </Button>
          </div>
        )}
      </header>

      <Card className="rounded-[2rem] border border-divider shadow-premium p-6 bg-surface space-y-3">
        <h2 className="text-xl font-bold">About</h2>
        <p className="text-text-secondary leading-relaxed">{bio.text || "Creator bio coming soon."}</p>
      </Card>

      {metrics.length > 0 && (
        <Card className="rounded-[2rem] border border-divider shadow-sm p-6 bg-surface">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Platform Metrics</h2>
            <Badge variant="primary">{metrics.length}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metrics.map((m) => {
              const followers = typeof m.followers === "number" ? `${m.followers.toLocaleString()} followers` : undefined;
              const views = typeof m.avgViews === "number" ? `${m.avgViews.toLocaleString()} avg views` : undefined;
              const er = typeof m.engagementRate === "number" ? `${m.engagementRate}% ER` : undefined;
              const sub = [followers, views, er].filter(Boolean).join(" • ");
              return (
                <div key={m.id} className="bg-background border border-divider rounded-xl p-4 flex items-center justify-between gap-4 group hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                    {(m.name || "P").substring(0,1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-text-primary truncate">{m.name}</h3>
                      {m.handle && <Badge variant="neutral" className="text-[10px] px-1.5 py-0">@{m.handle}</Badge>}
                    </div>
                    {sub && <p className="text-xs text-text-secondary mt-1">{sub}</p>}
                  </div>
                  {m.url && (
                    <a href={ensureProtocol(m.url)} target="_blank" rel="noopener noreferrer" className="bg-background border border-divider rounded-lg text-text-secondary hover:text-primary px-3 py-1.5 text-xs font-bold">
                      Visit
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {services.length > 0 && (
        <Card className="rounded-[2rem] border border-divider shadow-sm p-6 bg-surface">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Services</h2>
            <Badge variant="success">{services.length}</Badge>
          </div>
          <div className="space-y-3">
            {services.map((s) => (
              <div key={s.id} className="bg-background border border-divider rounded-xl p-4">
                <h3 className="font-bold text-text-primary">{s.name}</h3>
                {s.description && <p className="text-sm text-text-secondary mt-1">{s.description}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card id="contact" className="rounded-[2rem] border border-divider shadow-sm p-6 bg-surface">
        <h2 className="text-xl font-bold mb-3">Contact</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          {contact.email && <a href={`mailto:${contact.email}`} className="btn-primary rounded-xl text-sm font-bold px-5 py-2.5 border-none cursor-pointer">Email</a>}
          {contact.website && <a href={ensureProtocol(contact.website)} target="_blank" rel="noopener noreferrer" className="bg-background border border-divider rounded-xl text-sm font-bold px-5 py-2.5 cursor-pointer">Website</a>}
        </div>
      </Card>

      <footer className="text-center pt-4">
        <p className="text-xs text-text-secondary font-bold tracking-[0.2em] uppercase opacity-50">Powered by Stickylynx</p>
      </footer>

      <Modal
        isOpen={showRequestModal}
        onClose={() => { setShowRequestModal(false); setSent(false); }}
        title={sent ? "Request Sent" : "Request a Campaign"}
        description={sent ? "Thanks for your interest. The creator will get back to you soon." : "Provide a few details so the creator can follow up."}
        icon={sent ? "success" : "info"}
      >
        {!sent ? (
          <div className="w-full space-y-3 !mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input-base px-3 py-2 rounded-lg bg-background" placeholder="Your name" value={reqName} onChange={(e) => setReqName(e.target.value)} />
              <input className="input-base px-3 py-2 rounded-lg bg-background" placeholder="Your email" value={reqEmail} onChange={(e) => setReqEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input-base px-3 py-2 rounded-lg bg-background" placeholder="Brand / Company" value={reqBrand} onChange={(e) => setReqBrand(e.target.value)} />
              <input className="input-base px-3 py-2 rounded-lg bg-background" placeholder="Budget (optional)" value={reqBudget} onChange={(e) => setReqBudget(e.target.value)} />
            </div>
            <input className="input-base px-3 py-2 rounded-lg bg-background w-full" placeholder="Timeline (e.g. 4 weeks)" value={reqTimeline} onChange={(e) => setReqTimeline(e.target.value)} />
            <textarea className="input-base px-3 py-2 rounded-lg bg-background w-full min-h-[100px]" placeholder="Tell us a bit about the campaign…" value={reqMessage} onChange={(e) => setReqMessage(e.target.value)} />
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => { setShowRequestModal(false); }}>Cancel</Button>
              <Button variant="primary" onClick={submitRequest} disabled={sending || !reqName.trim() || !reqEmail.trim()}>{sending ? "Sending…" : "Send Request"}</Button>
            </div>
          </div>
        ) : (
          <div className="w-full text-sm text-text-secondary !mt-4">
            <p>We’ve emailed your request to the creator.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
