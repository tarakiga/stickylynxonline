"use client";
import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Dropzone } from "@/components/ui/Dropzone";
import { uploadAssetFile } from "@/lib/upload-client";

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
  deliverables?: string[];
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function MediaKitEditor({ page }: { page: any }) {
  const blocks = page.blocks || [];

  const findBlock = (type: string, section?: string) => {
    if (section) return blocks.find((b: any) => b.type === type && b.content?.section === section) || null;
    return blocks.find((b: any) => b.type === type) || null;
  };

  const heroBlock = findBlock("TEXT", "creator_hero");
  const bioBlock = findBlock("TEXT", "creator_bio");
  const metricsBlock = findBlock("GRID", "platform_metrics");
  const servicesBlock = findBlock("GRID", "services");
  const contactBlock = findBlock("CONTACT");

  const [heroName, setHeroName] = React.useState<string>(heroBlock?.content?.name || page.title || "");
  const [heroHandle, setHeroHandle] = React.useState<string>(heroBlock?.content?.handle || page.handle || "");
  const [heroNiche, setHeroNiche] = React.useState<string>(heroBlock?.content?.niche || "");
  const [heroCta, setHeroCta] = React.useState<string>(heroBlock?.content?.primaryCta || "Request a campaign");
  const [heroProfileImage, setHeroProfileImage] = React.useState<string>(heroBlock?.content?.profileImage || "");

  const [bioText, setBioText] = React.useState<string>(bioBlock?.content?.text || "");

  const [platforms, setPlatforms] = React.useState<PlatformMetric[]>(
    (metricsBlock?.content?.platforms || []).map((p: any) => ({
      id: p.id || uid("pf"),
      name: p.name || "",
      handle: p.handle || "",
      url: (p.url || "").replace(/^https?:\/\//i, ""),
      followers: typeof p.followers === "number" ? p.followers : undefined,
      avgViews: typeof p.avgViews === "number" ? p.avgViews : undefined,
      engagementRate: typeof p.engagementRate === "number" ? p.engagementRate : undefined,
      notes: p.notes || "",
    }))
  );

  const [services, setServices] = React.useState<ServiceItem[]>(
    (servicesBlock?.content?.services || []).map((s: any) => ({
      id: s.id || uid("svc"),
      name: s.name || "",
      description: s.description || "",
      deliverables: Array.isArray(s.deliverables) ? s.deliverables : [],
    }))
  );

  const [contactEmail, setContactEmail] = React.useState<string>(contactBlock?.content?.email || "");
  const [contactPhone, setContactPhone] = React.useState<string>(contactBlock?.content?.phone || "");
  const [contactWebsite, setContactWebsite] = React.useState<string>(contactBlock?.content?.website || "");
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const markDirty = () => setDirty(true);
  const handleViewPublic = () => window.open(`/${page.handle}`, "_blank");

  const addPlatform = () => {
    setPlatforms((p) => [...p, { id: uid("pf"), name: "", handle: "", url: "", followers: undefined, avgViews: undefined, engagementRate: undefined, notes: "" }]);
    markDirty();
  };
  const removePlatform = (id: string) => {
    setPlatforms((p) => p.filter((x) => x.id !== id));
    markDirty();
  };
  const addService = () => {
    setServices((s) => [...s, { id: uid("svc"), name: "", description: "", deliverables: [] }]);
    markDirty();
  };
  const removeService = (id: string) => {
    setServices((s) => s.filter((x) => x.id !== id));
    markDirty();
  };

  async function handleSave() {
    setSaving(true);
    try {
      const keep = (type: string, section?: string) => blocks.find((b: any) => (section ? b.type === type && b.content?.section === section : b.type === type)) || null;
      const assemble = [
        {
          type: "TEXT",
          content: { section: "creator_hero", name: heroName, handle: heroHandle, niche: heroNiche, primaryCta: heroCta, profileImage: heroProfileImage, logo: heroBlock?.content?.logo || "" },
          order: heroBlock?.order ?? 0,
        },
        {
          type: "TEXT",
          content: { section: "creator_bio", text: bioText },
          order: bioBlock?.order ?? 1,
        },
        keep("GRID", "audience") || {
          type: "GRID",
          content: { section: "audience", topAges: [], genderSplit: { male: 0, female: 0, other: 0 }, topCountries: [], interests: [] },
          order: 2,
        },
        {
          type: "GRID",
          content: {
            section: "platform_metrics",
            platforms: platforms.map((p) => ({
              id: p.id,
              name: p.name,
              handle: p.handle,
              url: p.url,
              followers: p.followers,
              avgViews: p.avgViews,
              engagementRate: p.engagementRate,
              notes: p.notes,
            })),
          },
          order: metricsBlock?.order ?? 3,
        },
        keep("GRID", "collaborations") || { type: "GRID", content: { section: "collaborations", items: [] }, order: 4 },
        keep("GRID", "content_examples") || { type: "GRID", content: { section: "content_examples", items: [] }, order: 5 },
        {
          type: "GRID",
          content: { section: "services", services: services.map((s) => ({ id: s.id, name: s.name, description: s.description, deliverables: s.deliverables || [] })) },
          order: servicesBlock?.order ?? 6,
        },
        keep("GRID", "testimonials") || { type: "GRID", content: { section: "testimonials", items: [] }, order: 7 },
        {
          type: "CONTACT",
          content: {
            email: contactEmail,
            phone: contactPhone,
            website: contactWebsite,
            managementName: contactBlock?.content?.managementName || "",
            managementEmail: contactBlock?.content?.managementEmail || "",
            briefForm: contactBlock?.content?.briefForm || { enabled: false },
          },
          order: contactBlock?.order ?? 8,
        },
      ];

      const res = await fetch(`/api/editor/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: assemble }),
      });
      if (res.ok) {
        setDirty(false);
      } else {
        try {
          const data = await res.json();
          alert(data.error || "Failed to save changes.");
        } catch {
          alert("Failed to save changes.");
        }
      }
    } finally {
      setSaving(false);
    }
  }

  const actionButtons = (
    <>
      <Button variant="secondary" onClick={handleViewPublic} className="py-2 px-4 shadow-sm text-xs rounded-xl cursor-pointer whitespace-nowrap">
        Preview
      </Button>
      <Button variant="primary" onClick={handleSave} disabled={saving || !dirty} className="py-2 px-5 shadow-sm text-sm cursor-pointer border-none text-white whitespace-nowrap">
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col items-start justify-between gap-3 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-primary text-sm font-semibold">
          <Badge variant="primary">Media Kit</Badge>
          <span>Edit Mode</span>
          {dirty && <span className="text-warning">· Unsaved changes</span>}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          {actionButtons}
        </div>
      </div>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-premium space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-text-primary">Creator Identity</h3>
          <Badge variant="success" className="text-[10px] px-2 py-0.5">Hero</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input labelInside="Creator Name" value={heroName} onChange={(e) => { setHeroName(e.target.value); markDirty(); }} />
          <Input labelInside="Handle" prefix="@" value={heroHandle} onChange={(e) => { setHeroHandle(e.target.value.replace(/^@/, "")); markDirty(); }} />
          <Input labelInside="Niche" value={heroNiche} onChange={(e) => { setHeroNiche(e.target.value); markDirty(); }} />
          <Input labelInside="Primary CTA" value={heroCta} onChange={(e) => { setHeroCta(e.target.value); markDirty(); }} />
          <div className="sm:col-span-2">
            <Dropzone
              label="Profile Image"
              hint="PNG, JPG up to 10MB"
              accept="image/*"
              onChange={async (file) => {
                const uploaded = await uploadAssetFile(file, { kind: "image", pageId: page.id });
                setHeroProfileImage(uploaded.secureUrl);
                markDirty();
              }}
            />
            {heroProfileImage && (
              <div className="mt-3 flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-divider bg-surface">
                  <img src={heroProfileImage} alt="Profile preview" className="w-full h-full object-cover" />
                </div>
                <Button variant="ghost" onClick={() => { setHeroProfileImage(""); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Remove</Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-text-primary">Bio</h3>
          <Badge variant="primary" className="text-[10px] px-2 py-0.5">About</Badge>
        </div>
        <Textarea rows={4} placeholder="Short, punchy paragraph about the creator…" value={bioText} onChange={(e) => { setBioText(e.target.value); markDirty(); }} />
      </Card>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-text-primary">Platform Metrics</h3>
          <Button variant="ghost" onClick={addPlatform} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Add Platform</Button>
        </div>
        <div className="space-y-3">
          {platforms.length === 0 && <p className="text-sm text-text-secondary">No platforms added yet.</p>}
          {platforms.map((p) => (
            <div key={p.id} className="bg-background border border-divider rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Platform"
                  options={[
                    { label: "Instagram", value: "Instagram" },
                    { label: "TikTok", value: "TikTok" },
                    { label: "YouTube", value: "YouTube" },
                    { label: "X (Twitter)", value: "X" },
                    { label: "Facebook", value: "Facebook" },
                    { label: "LinkedIn", value: "LinkedIn" },
                    { label: "Snapchat", value: "Snapchat" },
                    { label: "Pinterest", value: "Pinterest" },
                    { label: "Twitch", value: "Twitch" },
                    { label: "Threads", value: "Threads" },
                    { label: "Reddit", value: "Reddit" },
                    { label: "Other", value: "Other" },
                  ]}
                  value={p.name || ""}
                  onChange={(e) => { setPlatforms((prev) => prev.map((x) => x.id === p.id ? { ...x, name: e.target.value } : x)); markDirty(); }}
                />
                {p.name === "Other" && (
                  <Input labelInside="Custom Platform Name" value={p.notes || ""} onChange={(e) => { setPlatforms((prev) => prev.map((x) => x.id === p.id ? { ...x, notes: e.target.value } : x)); markDirty(); }} />
                )}
                <Input labelInside="Handle" prefix="@" value={p.handle} onChange={(e) => { setPlatforms((prev) => prev.map((x) => x.id === p.id ? { ...x, handle: e.target.value.replace(/^@/, "") } : x)); markDirty(); }} />
                <Input labelInside="URL" prefix="https://" value={p.url || ""} onChange={(e) => { setPlatforms((prev) => prev.map((x) => x.id === p.id ? { ...x, url: e.target.value.replace(/^https?:\/\//, "") } : x)); markDirty(); }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input labelInside="Followers" value={p.followers?.toString() || ""} onChange={(e) => { const v = e.target.value ? Number(e.target.value) : undefined; setPlatforms((prev) => prev.map((x) => x.id === p.id ? { ...x, followers: v } : x)); markDirty(); }} />
                <Input labelInside="Avg Views" value={p.avgViews?.toString() || ""} onChange={(e) => { const v = e.target.value ? Number(e.target.value) : undefined; setPlatforms((prev) => prev.map((x) => x.id === p.id ? { ...x, avgViews: v } : x)); markDirty(); }} />
                <Input labelInside="Engagement %" value={p.engagementRate?.toString() || ""} onChange={(e) => { const v = e.target.value ? Number(e.target.value) : undefined; setPlatforms((prev) => prev.map((x) => x.id === p.id ? { ...x, engagementRate: v } : x)); markDirty(); }} />
              </div>
              <Textarea rows={2} placeholder="Notes" value={p.notes || ""} onChange={(e) => { setPlatforms((prev) => prev.map((x) => x.id === p.id ? { ...x, notes: e.target.value } : x)); markDirty(); }} />
              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => removePlatform(p.id)} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer hover:text-error hover:bg-error/10">Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-text-primary">Services</h3>
          <Button variant="ghost" onClick={addService} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Add Service</Button>
        </div>
        <div className="space-y-3">
          {services.length === 0 && <p className="text-sm text-text-secondary">No services added yet.</p>}
          {services.map((s) => (
            <div key={s.id} className="bg-background border border-divider rounded-xl p-4 space-y-3">
              <Input labelInside="Service Name" value={s.name} onChange={(e) => { setServices((prev) => prev.map((x) => x.id === s.id ? { ...x, name: e.target.value } : x)); markDirty(); }} />
              <Textarea rows={2} placeholder="Description" value={s.description} onChange={(e) => { setServices((prev) => prev.map((x) => x.id === s.id ? { ...x, description: e.target.value } : x)); markDirty(); }} />
              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => removeService(s.id)} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer hover:text-error hover:bg-error/10">Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-text-primary">Contact</h3>
          <Badge variant="neutral" className="text-[10px] px-2 py-0.5">Details</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input labelInside="Email" value={contactEmail} onChange={(e) => { setContactEmail(e.target.value); markDirty(); }} />
          <Input labelInside="Phone" value={contactPhone} onChange={(e) => { setContactPhone(e.target.value); markDirty(); }} />
          <Input labelInside="Website" value={contactWebsite} onChange={(e) => { setContactWebsite(e.target.value); markDirty(); }} />
        </div>
      </Card>
      <div className="sticky bottom-4 z-20">
        <div className="ml-auto flex w-full max-w-md items-center justify-end gap-3 rounded-[1.6rem] border border-primary/20 bg-surface/95 p-3 shadow-premium backdrop-blur">
          <div className="mr-auto px-2 text-xs font-semibold text-text-secondary">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </div>
          {actionButtons}
        </div>
      </div>
    </div>
  );
}
