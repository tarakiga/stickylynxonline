"use client";
import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Phone, AtSign, Globe } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { currencySymbol } from "@/lib/utils";

function ensureProtocol(url?: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") || url.startsWith("data:")) return url;
  return `https://${url}`;
}

export function FoodMenuPublic({ page }: { page: any }) {
  const blocks = page.blocks || [];
  const brand = blocks.find((b: any) => b.type === "TEXT" && b.content?.section === "brand_header")?.content || {};
  const service = blocks.find((b: any) => b.type === "GRID" && b.content?.section === "service_info")?.content || {};
  const menu = blocks.find((b: any) => b.type === "GRID" && b.content?.section === "menu_sections")?.content || {};
  const extras = blocks.find((b: any) => b.type === "GRID" && b.content?.section === "extras")?.content || {};

  const allSections = (menu.sections || []) as Array<any>;
  const [q, setQ] = React.useState("");
  const userCurrency = (page.user?.currencyCode) || "USD";
  const sym = currencySymbol(userCurrency);

  const filteredSections = allSections.map((s) => {
    const items = (s.items || []).filter((it: any) => {
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        (it.name || "").toLowerCase().includes(needle) ||
        (it.baseDescription || "").toLowerCase().includes(needle) ||
        (it.tags || []).join(",").toLowerCase().includes(needle)
      );
    });
    return { ...s, items };
  }).filter((s) => s.items.length > 0 || !q.trim());

  const accordionItems = filteredSections.map((s) => ({
    id: s.id,
    title: s.name,
    content: (
      <div className="space-y-3">
        {(s.items || []).map((it: any) => {
          const tags = (it.tags || []) as string[];
          return (
            <div key={it.id} className="bg-background border border-divider rounded-xl p-4 group hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-3">
                {it.photoUrl && <img src={ensureProtocol(it.photoUrl)} alt={it.name} className="w-16 h-16 rounded-lg object-cover border border-divider" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-text-primary">{it.name}</h4>
                    {tags.map((t: string, i: number) => <Badge key={i} variant="neutral" className="text-[10px] px-1.5 py-0">{t}</Badge>)}
                  </div>
                  {it.baseDescription && <p className="text-sm text-text-secondary mt-1">{it.baseDescription}</p>}
                  <div className="flex items-center flex-wrap gap-2 mt-2">
                    {(it.variations || []).map((v: any, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-surface border border-divider">
                        {v.name}{v.size ? ` • ${v.size}` : ""} — {sym} {v.price}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )
  }));

  function SocialIcon({ platform, url }: { platform?: string; url?: string }) {
    const p = (platform || "").toLowerCase();
    const u = (url || "").toLowerCase();
    const inferred =
      p.includes("instagram") || u.includes("instagram.com") ? "instagram" :
      p.includes("tiktok") || u.includes("tiktok.com") ? "tiktok" :
      p.includes("youtube") || u.includes("youtube.com") || u.includes("youtu.be") ? "youtube" :
      p.includes("twitter") || p.includes("x") || u.includes("twitter.com") || u.includes("x.com") ? "x" :
      p.includes("facebook") || u.includes("facebook.com") ? "facebook" :
      p.includes("linkedin") || u.includes("linkedin.com") ? "linkedin" :
      p.includes("reddit") || u.includes("reddit.com") ? "reddit" :
      p.includes("whatsapp") || u.includes("whatsapp.com") || u.includes("wa.me") ? "whatsapp" :
      "globe";
    const slug = inferred;
    const src = `/social/${slug}.svg`;
    return (
      <img
        src={src}
        alt={slug}
        width={16}
        height={16}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/social/globe.svg"; }}
      />
    );
  }

  const emails: string[] = Array.isArray(service.emails) ? service.emails : [];
  const phones: string[] = Array.isArray(service.phones) ? service.phones : [];
  const [showEmailList, setShowEmailList] = React.useState(false);
  const [showPhoneList, setShowPhoneList] = React.useState(false);
  const hours: Array<{ day: number; open: string; close: string }> = Array.isArray(service.hours) ? service.hours : [];

  function isOpenNow() {
    if (!Array.isArray(hours) || hours.length === 0) return null;
    const now = new Date();
    const day = now.getDay();
    const entry = hours.find((h) => h.day === day);
    if (!entry || !entry.open || !entry.close) return false;
    const [oh, om] = entry.open.split(":").map(Number);
    const [ch, cm] = entry.close.split(":").map(Number);
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), oh || 0, om || 0).getTime();
    const endSame = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ch || 0, cm || 0).getTime();
    const current = now.getTime();
    if (entry.open && entry.close && (oh > ch || (oh === ch && (om || 0) > (cm || 0)))) {
      const endNext = endSame + 24 * 60 * 60 * 1000;
      return current >= start || current <= endNext;
    }
    return current >= start && current <= endSame;
  }
  const openState = isOpenNow();

  const emailClick = () => {
    if (emails.length <= 1) {
      const em = emails[0];
      if (em) window.location.href = `mailto:${em}`;
    } else {
      setShowEmailList(true);
    }
  };
  const phoneClick = () => {
    if (phones.length <= 1) {
      const ph = phones[0];
      if (ph) window.location.href = `tel:${ph}`;
    } else {
      setShowPhoneList(true);
    }
  };

  return (
    <div className="max-w-screen-md mx-auto min-h-screen bg-background text-text-primary px-4 py-8 pb-24 space-y-6">
      <header className="space-y-3 text-center">
        <div className="relative">
          {brand.heroImage ? (
            <div className="w-full h-40 rounded-2xl overflow-hidden border border-divider">
              <img src={ensureProtocol(brand.heroImage)} alt={brand.businessName || page.title || page.handle} className="w-full h-full object-cover" />
            </div>
          ) : null}
          {brand.logoImage && (
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 w-16 h-16 rounded-2xl overflow-hidden border-2 border-background shadow-premium">
              <img src={ensureProtocol(brand.logoImage)} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
            </div>
          )}
        </div>
        <div className="pt-10">
          <h1 className="text-3xl font-bold tracking-tight">{brand.businessName || page.title || page.handle}</h1>
        </div>
        {brand.tagline && <p className="text-text-secondary font-semibold">{brand.tagline}</p>}
        {openState !== null && (
          <div className="pt-1">
            {openState ? <Badge variant="success">Open</Badge> : <Badge variant="error">Closed</Badge>}
          </div>
        )}
        {(emails.length > 0 || phones.length > 0) && (
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <button onClick={emailClick} className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-background border border-divider text-text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer border-none">
              <AtSign size={22} />
            </button>
            <button onClick={phoneClick} className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-background border border-divider text-text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer border-none">
              <Phone size={22} />
            </button>
          </div>
        )}
        {(Array.isArray(service.socials) && service.socials.length > 0) && (
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            {(service.socials || []).map((s: any, i: number) => (
              <a key={`soc-${i}`} href={ensureProtocol(s.url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-background border border-divider text-text-secondary hover:text-primary hover:border-primary transition-colors">
                <SocialIcon platform={String(s.platform || "")} url={String(s.url || "")} />
              </a>
            ))}
          </div>
        )}
      </header>

      {(service.locations || []).length > 0 && (
        <Card className="rounded-[2rem] border border-divider shadow-sm p-6 bg-surface">
          <LocationsBlock locations={service.locations} />
        </Card>
      )}
      
      {Array.isArray(service.hours) && service.hours.length > 0 && (
        <Card className="rounded-[2rem] border border-divider shadow-sm p-6 bg-surface">
          <h2 className="text-xl font-bold mb-3">Hours</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {service.hours.map((h: any, i: number) => {
              const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              const label = days[h.day] || days[i] || "";
              const val = h.open && h.close ? `${h.open} – ${h.close}` : "Closed";
              return (
                <div key={i} className="flex items-center justify-between bg-background border border-divider rounded-xl px-3 py-2">
                  <span className="text-sm font-bold text-text-primary">{label}</span>
                  <span className="text-sm text-text-secondary">{val}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="rounded-[2rem] border border-divider shadow-sm p-6 bg-surface">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Menu</h2>
          <div className="w-52">
            <Input placeholder="Search items…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <Accordion items={accordionItems} defaultOpenId={(menu.defaultOpenSectionIds || [])[0]} />
      </Card>

      {(extras.items || []).length > 0 && (
        <Card className="rounded-[2rem] border border-divider shadow-sm p-6 bg-surface">
          <h2 className="text-xl font-bold mb-4">{extras.title || "Add-ons"}</h2>
          <div className="space-y-3">
            {(extras.items || []).map((it: any, i: number) => (
              <div key={i} className="bg-background border border-divider rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-text-primary">{it.name}</h4>
                  {it.baseDescription && <p className="text-sm text-text-secondary">{it.baseDescription}</p>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {(it.variations || []).map((v: any, j: number) => (
                    <Badge key={j} variant="neutral" className="text-[10px] px-1.5 py-0">{sym} {v.price}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      <Modal
        isOpen={showEmailList}
        onClose={() => setShowEmailList(false)}
        title="Contact via Email"
        description="Choose an email address"
        icon="info"
      >
        <div className="space-y-2 mt-2">
          {emails.map((em, i) => (
            <a key={i} href={`mailto:${em}`} className="block w-full text-center bg-background border border-divider rounded-xl px-4 py-2 font-bold hover:text-primary hover:border-primary cursor-pointer">
              {em}
            </a>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={showPhoneList}
        onClose={() => setShowPhoneList(false)}
        title="Call"
        description="Choose a phone number"
        icon="info"
      >
        <div className="space-y-2 mt-2">
          {phones.map((ph, i) => (
            <a key={i} href={`tel:${ph}`} className="block w-full text-center bg-background border border-divider rounded-xl px-4 py-2 font-bold hover:text-primary hover:border-primary cursor-pointer">
              {ph}
            </a>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function LocationsBlock({ locations }: { locations: Array<{ name?: string; address?: string; city?: string; country?: string }> }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Locations</h2>
        <Button variant="ghost" onClick={() => setOpen((v) => !v)} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">
          {open ? "Hide" : "Show"}
        </Button>
      </div>
      {open && (
        <div className="space-y-3">
          {locations.map((l, i) => {
            const line = [l.address, l.city, l.country].filter(Boolean).join(", ");
            const query = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(line || l.name || "")}`;
            return (
              <div key={i} className="bg-background border border-divider rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-text-primary">{l.name || "Location"}</h4>
                  {line && <p className="text-sm text-text-secondary">{line}</p>}
                </div>
                <a href={query} target="_blank" rel="noopener noreferrer" className="bg-background border border-divider rounded-xl text-sm font-bold px-4 py-2 cursor-pointer hover:border-primary hover:text-primary">
                  Directions
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
