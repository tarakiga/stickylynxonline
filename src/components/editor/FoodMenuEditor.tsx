"use client";
import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Dropzone } from "@/components/ui/Dropzone";
import { MultiContactInput } from "@/components/ui/MultiContactInput";
import { PriceRepeater, type PriceOption } from "@/components/ui/PriceRepeater";
import Image from "next/image";
import { uploadAssetFile } from "@/lib/upload-client";
import { currencySymbol } from "@/lib/utils";
import { LocationSearch } from "@/components/ui/LocationSearch";

type Variation = { id: string; name: string; size?: string; price: string; currency: string; description?: string };
type MenuItem = { id: string; name: string; baseDescription?: string; variations: Variation[]; tags: string; photo?: string; notes?: string };
type MenuSection = { id: string; name: string; description?: string; highlighted: boolean; items: MenuItem[] };
type FoodMenuBlock = { type: string; content?: unknown };
type FoodMenuPage = { id: string; title?: string | null; handle: string; blocks?: FoodMenuBlock[] };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : []
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function asStringArray(value: unknown) {
  return asArray(value).filter((item): item is string => typeof item === "string")
}

function uid(p = "x") { return `${p}-${Date.now()}-${Math.random().toString(36).slice(2,7)}` }

export function FoodMenuEditor({
  page,
  defaultCurrency = "USD",
  canUseAdvancedFoodMenu,
  canUseCustomBranding,
}: {
  page: FoodMenuPage
  defaultCurrency?: string
  canUseAdvancedFoodMenu: boolean
  canUseCustomBranding: boolean
}) {
  const blocks = page.blocks || [];
  const brand = asRecord(blocks.find((b) => b.type === "TEXT" && asString(asRecord(b.content)?.section) === "brand_header")?.content) || {};
  const service = asRecord(blocks.find((b) => b.type === "GRID" && asString(asRecord(b.content)?.section) === "service_info")?.content) || {};
  const menu = asRecord(blocks.find((b) => b.type === "GRID" && asString(asRecord(b.content)?.section) === "menu_sections")?.content) || {};
  const extras = asRecord(blocks.find((b) => b.type === "GRID" && asString(asRecord(b.content)?.section) === "extras")?.content) || {};

  const [businessName, setBusinessName] = React.useState<string>(asString(brand.businessName, page.title || page.handle));
  const [tagline, setTagline] = React.useState<string>(asString(brand.tagline));
  const [cuisineType, setCuisineType] = React.useState<string>(asString(brand.cuisineType));
  const [shortDesc, setShortDesc] = React.useState<string>(asString(brand.shortDescription));
  const [heroImage, setHeroImage] = React.useState<string>(asString(brand.heroImage));
  const [logoImage, setLogoImage] = React.useState<string>(asString(brand.logoImage));

  const [serviceType, setServiceType] = React.useState<string>(asString(service.serviceType, "all"));
  const [serviceNotes, setServiceNotes] = React.useState<string>(asString(service.notes));
  const [emails, setEmails] = React.useState<string[]>(asStringArray(service.emails));
  const [phones, setPhones] = React.useState<string[]>(asStringArray(service.phones));
  const [socials, setSocials] = React.useState<Array<{ id: string; platform: string; url: string }>>(
    asArray(service.socials).map((socialValue) => {
      const social = asRecord(socialValue) || {}
      return {
        id: uid("soc"),
        platform: asString(social.platform),
        url: asString(social.url).replace(/^https?:\/\//i, ""),
      }
    })
  );
  const [locations, setLocations] = React.useState<Array<{ id: string; name: string; address: string; city?: string; country?: string }>>(
    asArray(service.locations).map((locationValue) => {
      const location = asRecord(locationValue) || {}
      return {
        id: uid("loc"),
        name: asString(location.name),
        address: asString(location.address || location.display_name),
        city: asString(location.city),
        country: asString(location.country),
      }
    })
  );
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const defaultHours = dayLabels.map((_, i) => ({ day: i, open: "", close: "" }));
  const [hours, setHours] = React.useState<Array<{ day: number; open: string; close: string }>>(
    asArray(service.hours).length > 0
      ? asArray(service.hours).map((hourValue, i) => {
          const hour = asRecord(hourValue) || {}
          return {
            day: typeof hour.day === "number" ? hour.day : i,
            open: asString(hour.open),
            close: asString(hour.close),
          }
        })
      : defaultHours
  );

  const [sections, setSections] = React.useState<MenuSection[]>(
    asArray(menu.sections).map((sectionValue) => {
      const section = asRecord(sectionValue) || {}
      return {
        id: asString(section.id, uid("sec")),
        name: asString(section.name),
        description: asString(section.description),
        highlighted: Boolean(section.highlighted),
        items: asArray(section.items).map((itemValue) => {
          const item = asRecord(itemValue) || {}
          return {
            id: asString(item.id, uid("mi")),
            name: asString(item.name),
            baseDescription: asString(item.baseDescription),
            tags: asStringArray(item.tags).join(", "),
            notes: asString(item.notes),
            photo: asString(item.photoUrl),
            variations: asArray(item.variations).map((variationValue) => {
              const variation = asRecord(variationValue) || {}
              return {
                id: uid("var"),
                name: asString(variation.name),
                size: asString(variation.size),
                price: String(variation.price ?? ""),
                currency: asString(variation.currency, defaultCurrency),
                description: asString(variation.description),
              }
            }),
          }
        }),
      }
    })
  );

  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const markDirty = () => setDirty(true);
  const handleViewPublic = () => window.open(`/${page.handle}`, "_blank");
  const advancedFoodMenuMessage = "Advanced Food Menu is available on Creator. Payments are not live yet, so higher tiers are still locked."
  const customBrandingMessage = "Custom Branding is available on Creator. Payments are not live yet, so higher tiers are still locked."

  function addSection() {
    setSections(prev => [...prev, { id: uid("sec"), name: "New Section", description: "", highlighted: false, items: [] }]); markDirty();
  }
  function removeSection(id: string) {
    setSections(prev => prev.filter(s => s.id !== id)); markDirty();
  }
  function addItem(secId: string) {
    setSections(prev => prev.map(s => s.id === secId ? { ...s, items: [...s.items, { id: uid("mi"), name: "New Item", baseDescription: "", tags: "", notes: "", photo: "", variations: [{ id: uid("var"), name: "Default", price: "", currency: defaultCurrency }] }] } : s)); markDirty();
  }
  function removeItem(secId: string, itemId: string) {
    setSections(prev => prev.map(s => s.id === secId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s)); markDirty();
  }
  function updateVariationsFromPriceRepeater(secId: string, itemId: string, options: PriceOption[], currency: string) {
    setSections(prev => prev.map(s => s.id === secId ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, variations: options.map(o => ({ id: o.id, name: o.name, price: o.price, currency })) } : i) } : s))
    markDirty();
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = [
        { type: "TEXT", content: { section: "brand_header", businessName, tagline, cuisineType, shortDescription: shortDesc, heroImage, logoImage }, order: 0 },
        { type: "GRID", content: { section: "service_info", serviceType, description: serviceNotes, emails, phones, socials: socials.map(s => ({ platform: s.platform, url: s.url })), locations: locations.map(l => ({ name: l.name, address: l.address, city: l.city, country: l.country })), hours: hours, orderingLinks: service.orderingLinks || [], notes: serviceNotes }, order: 1 },
        { type: "GRID", content: { section: "menu_sections", defaultOpenSectionIds: menu.defaultOpenSectionIds || [], collapsible: true, hasSidebar: menu.hasSidebar || false, hasSearch: menu.hasSearch ?? true, maxDefaultOpen: menu.maxDefaultOpen || 3, sections: sections.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          highlighted: s.highlighted,
          items: s.items.map(it => ({
            id: it.id,
            name: it.name,
            baseDescription: it.baseDescription,
            variations: it.variations.map(v => ({ name: v.name, price: Number(v.price || 0), currency: v.currency || "USD" })),
            tags: it.tags ? it.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
            photoUrl: it.photo || "",
            notes: it.notes || "",
          }))
        })) }, order: 2 },
        { type: "GRID", content: { section: "extras", title: extras.title || "Add-ons", description: extras.description || "", items: extras.items || [] }, order: 3 },
      ];
      const res = await fetch(`/api/editor/${page.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ blocks: payload }) });
      if (!res.ok) { try { const e = await res.json(); alert(e.error || "Failed to save"); } catch { alert("Failed to save"); } }
      else { setDirty(false); }
    } finally { setSaving(false); }
  }

  const actionButtons = (
    <>
      <Button variant="secondary" onClick={handleViewPublic} className="py-2 px-4 shadow-sm text-xs rounded-xl cursor-pointer whitespace-nowrap">Preview</Button>
      <Button variant="primary" onClick={handleSave} disabled={saving || !dirty} className="py-2 px-5 shadow-sm text-sm cursor-pointer border-none text-white whitespace-nowrap">{saving ? "Saving…" : "Save Changes"}</Button>
    </>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col items-start justify-between gap-3 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-primary text-sm font-semibold">
          <Badge variant="primary">Food Menu</Badge>
          <span>Edit Mode</span>
          {dirty && <span className="text-warning">· Unsaved changes</span>}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          {actionButtons}
        </div>
      </div>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-premium space-y-4">
        <h3 className="font-bold text-xl text-text-primary">Brand Header</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input labelInside="Business Name" value={businessName} onChange={(e) => { setBusinessName(e.target.value); markDirty(); }} />
          <Input labelInside="Tagline" value={tagline} onChange={(e) => { setTagline(e.target.value); markDirty(); }} />
          <Input labelInside="Cuisine Type" value={cuisineType} onChange={(e) => { setCuisineType(e.target.value); markDirty(); }} />
          <Textarea rows={2} placeholder="Short description" value={shortDesc} onChange={(e) => { setShortDesc(e.target.value); markDirty(); }} />
          <div className="sm:col-span-2">
            <Dropzone label="Hero Image" hint="PNG, JPG up to 10MB" accept="image/*" onChange={async (file) => { const uploaded = await uploadAssetFile(file, { kind: "image", pageId: page.id }); setHeroImage(uploaded.secureUrl); markDirty(); }} />
            {heroImage && <div className="mt-3"><Image src={heroImage} alt="Hero" width={1200} height={384} unoptimized className="max-h-48 w-full rounded-xl border border-divider object-cover" /></div>}
          </div>
          <div className="sm:col-span-2">
            <Dropzone label="Restaurant Logo" hint={canUseCustomBranding ? "PNG, JPG up to 10MB" : customBrandingMessage} accept="image/*" disabled={!canUseCustomBranding} onChange={async (file) => { const uploaded = await uploadAssetFile(file, { kind: "image", pageId: page.id }); setLogoImage(uploaded.secureUrl); markDirty(); }} />
            {logoImage && <div className="mt-3"><Image src={logoImage} alt="Logo" width={64} height={64} unoptimized className="h-16 w-16 rounded-xl border border-divider object-cover" /></div>}
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-xl text-text-primary">Service Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Service Type" options={[
            { label: "All", value: "all" }, { label: "Dine-in", value: "dine-in" }, { label: "Takeaway", value: "takeaway" }, { label: "Delivery", value: "delivery" }, { label: "Combo", value: "combo" },
          ]} value={serviceType} onChange={(e) => { setServiceType(e.target.value); markDirty(); }} />
          <Textarea rows={2} placeholder="Service notes (e.g., hours)" value={serviceNotes} onChange={(e) => { setServiceNotes(e.target.value); markDirty(); }} className="sm:col-span-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MultiContactInput label="Emails" value={emails} onChange={(v) => { setEmails(v); markDirty(); }} maxItems={canUseAdvancedFoodMenu ? undefined : 1} addPlaceholder={canUseAdvancedFoodMenu ? "Add contact..." : "Creator required for more"} />
          <MultiContactInput label="Phones" value={phones} onChange={(v) => { setPhones(v); markDirty(); }} maxItems={canUseAdvancedFoodMenu ? undefined : 1} addPlaceholder={canUseAdvancedFoodMenu ? "Add contact..." : "Creator required for more"} />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-semibold text-text-secondary">Social Links</span>
          <div className="space-y-2">
            {socials.map((s) => (
              <div key={s.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Select label="Platform" value={s.platform} onChange={(e) => { const v = e.target.value; setSocials(prev => prev.map(x => x.id === s.id ? { ...x, platform: v } : x)); markDirty(); }} options={[
                  { label: "Instagram", value: "instagram" },
                  { label: "TikTok", value: "tiktok" },
                  { label: "YouTube", value: "youtube" },
                  { label: "X (Twitter)", value: "twitter" },
                  { label: "Facebook", value: "facebook" },
                  { label: "LinkedIn", value: "linkedin" },
                  { label: "Reddit", value: "reddit" },
                  { label: "WhatsApp", value: "whatsapp" },
                  { label: "Website", value: "website" }
                ]} />
                <Input labelInside="URL" prefix="https://" value={s.url} onChange={(e) => { const v = e.target.value.replace(/^https?:\/\//i, ""); setSocials(prev => prev.map(x => x.id === s.id ? { ...x, url: v } : x)); markDirty(); }} className="sm:col-span-2" />
                <Button variant="ghost" onClick={() => { setSocials(prev => prev.filter(x => x.id !== s.id)); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer hover:text-error hover:bg-error/10 justify-self-start">
                  Remove
                </Button>
              </div>
            ))}
            <div>
              <Button variant="ghost" onClick={() => { setSocials(prev => [...prev, { id: uid("soc"), platform: "", url: "" }]); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer" disabled={!canUseAdvancedFoodMenu && socials.length >= 1}>Add Social</Button>
              {!canUseAdvancedFoodMenu && <p className="text-[11px] text-text-secondary mt-2">{advancedFoodMenuMessage}</p>}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <span className="text-sm font-semibold text-text-secondary">Locations</span>
          <div className="space-y-2">
            {locations.map((l) => (
              <div key={l.id} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                  <Input labelInside="Location Name" value={l.name} onChange={(e) => { const v = e.target.value; setLocations(prev => prev.map(x => x.id === l.id ? { ...x, name: v } : x)); markDirty(); }} />
                  <div className="sm:col-span-2 flex justify-start sm:justify-end">
                    <Button variant="ghost" onClick={() => { setLocations(prev => prev.filter(x => x.id !== l.id)); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer hover:text-error hover:bg-error/10">
                      Remove Location
                    </Button>
                  </div>
                </div>
                <LocationSearch label="Location (Async OpenStreetMap)" onSelect={(display) => {
                  setLocations(prev => prev.map(x => x.id === l.id ? { ...x, address: display } : x));
                  markDirty();
                }} />
              </div>
            ))}
            <div>
              <Button variant="ghost" onClick={() => { setLocations(prev => [...prev, { id: uid("loc"), name: "", address: "" }]); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer" disabled={!canUseAdvancedFoodMenu && locations.length >= 1}>Add Location</Button>
              {!canUseAdvancedFoodMenu && <p className="text-[11px] text-text-secondary mt-2">{advancedFoodMenuMessage}</p>}
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <span className="text-sm font-semibold text-text-secondary">Available Times</span>
          <div className="space-y-2">
            {hours.map((h, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Input labelInside="Day" value={dayLabels[h.day] || dayLabels[i]} onChange={() => {}} disabled />
                <Input labelInside="Open" type="time" value={h.open} onChange={(e) => { const v = e.target.value; setHours(prev => prev.map((x, idx) => idx === i ? { ...x, open: v } : x)); markDirty(); }} />
                <Input labelInside="Close" type="time" value={h.close} onChange={(e) => { const v = e.target.value; setHours(prev => prev.map((x, idx) => idx === i ? { ...x, close: v } : x)); markDirty(); }} />
                <Button variant="ghost" onClick={() => { setHours(prev => prev.map((x, idx) => idx === i ? { ...x, open: "", close: "" } : x)); markDirty(); }} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">
                  Mark Closed
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border border-divider bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-text-primary">Menu Sections</h3>
        </div>
        <div className="space-y-4">
          {sections.length === 0 && <p className="text-sm text-text-secondary">No sections yet.</p>}
          {sections.map((s) => (
            <div key={s.id} className="bg-background border border-divider rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Input labelInside="Section Name" value={s.name} onChange={(e) => { setSections(prev => prev.map(x => x.id === s.id ? { ...x, name: e.target.value } : x)); markDirty(); }} />
                <Input labelInside="Description" value={s.description || ""} onChange={(e) => { setSections(prev => prev.map(x => x.id === s.id ? { ...x, description: e.target.value } : x)); markDirty(); }} className="sm:col-span-2" />
                <Button variant="ghost" onClick={() => removeSection(s.id)} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer hover:text-error hover:bg-error/10 justify-self-start">Remove</Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-text-primary">Items</h4>
                  <Button variant="ghost" onClick={() => addItem(s.id)} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Add Item</Button>
                </div>
                {s.items.length === 0 && <p className="text-xs text-text-secondary">No items yet.</p>}
                {s.items.map((it) => (
                  <div key={it.id} className="border border-divider rounded-xl p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input labelInside="Item Name" value={it.name} onChange={(e) => { setSections(prev => prev.map(x => x.id === s.id ? { ...x, items: x.items.map(y => y.id === it.id ? { ...y, name: e.target.value } : y) } : x)); markDirty(); }} />
                      <Input labelInside="Tags (comma separated)" value={it.tags} onChange={(e) => { setSections(prev => prev.map(x => x.id === s.id ? { ...x, items: x.items.map(y => y.id === it.id ? { ...y, tags: e.target.value } : y) } : x)); markDirty(); }} />
                      <Button variant="ghost" onClick={() => removeItem(s.id, it.id)} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer hover:text-error hover:bg-error/10 justify-self-start">Remove Item</Button>
                    </div>
                    <Textarea rows={2} placeholder="Base description" value={it.baseDescription || ""} onChange={(e) => { setSections(prev => prev.map(x => x.id === s.id ? { ...x, items: x.items.map(y => y.id === it.id ? { ...y, baseDescription: e.target.value } : y) } : x)); markDirty(); }} className="mt-2" />
                    <div className="mt-3">
                      <Dropzone label="Item Photo" hint="PNG, JPG up to 10MB" accept="image/*" onChange={async (file) => {
                        const uploaded = await uploadAssetFile(file, { kind: "image", pageId: page.id });
                        setSections(prev => prev.map(x => x.id === s.id ? { ...x, items: x.items.map(y => y.id === it.id ? { ...y, photo: uploaded.secureUrl } : y) } : x));
                        markDirty();
                      }} />
                      {it.photo && <Image src={it.photo} alt="Item" width={800} height={320} unoptimized className="mt-2 max-h-40 w-full rounded-lg border border-divider object-cover" />}
                    </div>
                    <div className="mt-3 space-y-2">
                      <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Variations & Prices</span>
                      <PriceRepeater
                        value={it.variations.map(v => ({ id: v.id, name: v.name, price: v.price }))}
                        onChange={(opts) => {
                          const currency = defaultCurrency
                          updateVariationsFromPriceRepeater(s.id, it.id, opts, currency)
                        }}
                        currencySymbol={currencySymbol(defaultCurrency)}
                        disableMultiple={!canUseAdvancedFoodMenu && it.variations.length >= 1}
                        lockedMessage={advancedFoodMenuMessage}
                      />
                    </div>
                    <Input labelInside="Notes" value={it.notes || ""} onChange={(e) => { setSections(prev => prev.map(x => x.id === s.id ? { ...x, items: x.items.map(y => y.id === it.id ? { ...y, notes: e.target.value } : y) } : x)); markDirty(); }} className="mt-2" />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-2">
            <Button variant="ghost" onClick={addSection} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Add Section</Button>
          </div>
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
