"use client";
import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Dropzone } from "@/components/ui/Dropzone";
import { IconButton } from "@/components/ui/IconButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { uploadAssetFile } from "@/lib/upload-client";
import Image from "next/image";
import type { EpkHero, StreamingLink, StreamingPlatform, EpkTrack, EpkVideo, EpkGalleryImage, EpkBio, EpkContact, PressFeature, Highlight, TourEvent } from "@/types/epk";
import { STREAMING_PLATFORMS, SOCIAL_PLATFORMS, TOUR_STATUS_META } from "@/types/epk";
import type { EditorPage } from "@/types/editor-page";
import { findEditorBlock } from "@/types/editor-page";
import {
  Save, Loader2, Eye, Plus, Trash2, Music, Video,
  Link as LinkIcon, ExternalLink, Newspaper, Award, Calendar,
} from "lucide-react";

let _seq = 0;
function uid() { return `epk-${Date.now()}-${++_seq}`; }

type EpkItemsBlock<T> = {
  items?: T[]
}

type EpkGridBlock = {
  press?: PressFeature[]
  highlights?: Highlight[]
  tours?: TourEvent[]
}

export function EpkEditor({ page }: { page: EditorPage }) {
  const blocks = page.blocks || [];

  const heroBlock = (findEditorBlock(blocks, "TEXT", "hero")?.content || {}) as Partial<EpkHero>;
  const linksBlock = (findEditorBlock(blocks, "LINK")?.content || {}) as EpkItemsBlock<StreamingLink>;
  const audioBlock = (findEditorBlock(blocks, "AUDIO")?.content || {}) as EpkItemsBlock<EpkTrack>;
  const videoBlock = (findEditorBlock(blocks, "VIDEO")?.content || {}) as EpkItemsBlock<EpkVideo>;
  const imageBlock = (findEditorBlock(blocks, "IMAGE")?.content || {}) as EpkItemsBlock<EpkGalleryImage>;
  const bioBlock = (findEditorBlock(blocks, "TEXT", "bio")?.content || {}) as Partial<EpkBio>;
  const contactBlock = (findEditorBlock(blocks, "CONTACT")?.content || {}) as Partial<EpkContact>;
  const gridBlock = (findEditorBlock(blocks, "GRID")?.content || {}) as EpkGridBlock;

  /* ── State ─────────────────────────────────────────────────── */
  const [saving, setSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);
  const [dirty, setDirty] = React.useState(false);
  const markDirty = React.useCallback(() => setDirty(true), []);

  // Hero
  const [hero, setHero] = React.useState<EpkHero>({
    artistName: heroBlock.artistName || page.title || "",
    tagline: heroBlock.tagline || "",
    genre: heroBlock.genre || "",
    profileImage: heroBlock.profileImage || "",
    coverImage: heroBlock.coverImage || "",
  });

  // Streaming Links
  const [links, setLinks] = React.useState<StreamingLink[]>(linksBlock.items || []);
  const [showAddLink, setShowAddLink] = React.useState(false);
  const [newLinkPlatform, setNewLinkPlatform] = React.useState<StreamingPlatform>("spotify");
  const [newLinkUrl, setNewLinkUrl] = React.useState("");

  // Tracks — now with audio upload + metadata extraction
  const [tracks, setTracks] = React.useState<EpkTrack[]>(audioBlock.items || []);
  const [showAddTrack, setShowAddTrack] = React.useState(false);
  const [newTrackTitle, setNewTrackTitle] = React.useState("");
  const [newTrackDuration, setNewTrackDuration] = React.useState("");
  const [newTrackUrl, setNewTrackUrl] = React.useState("");
  const [trackUploading, setTrackUploading] = React.useState(false);

  // Videos
  const [videos, setVideos] = React.useState<EpkVideo[]>(videoBlock.items || []);
  const [showAddVideo, setShowAddVideo] = React.useState(false);
  const [newVideoTitle, setNewVideoTitle] = React.useState("");
  const [newVideoUrl, setNewVideoUrl] = React.useState("");

  // Gallery
  const [gallery, setGallery] = React.useState<EpkGalleryImage[]>(imageBlock.items || []);

  // Bio
  const [bio, setBio] = React.useState<EpkBio>({ text: bioBlock.text || "", pressKitUrl: bioBlock.pressKitUrl || "" });

  // Contact
  const [contact, setContact] = React.useState<EpkContact>({
    email: contactBlock.email || "", phone: contactBlock.phone || "",
    managementName: contactBlock.managementName || "", managementEmail: contactBlock.managementEmail || "",
    socials: contactBlock.socials || {},
  });

  // New sections: Press, Highlights, Tours
  const [press, setPress] = React.useState<PressFeature[]>(gridBlock.press || []);
  const [highlights, setHighlights] = React.useState<Highlight[]>(gridBlock.highlights || []);
  const [tours, setTours] = React.useState<TourEvent[]>(gridBlock.tours || []);
  const [showAddPress, setShowAddPress] = React.useState(false);
  const [showAddHighlight, setShowAddHighlight] = React.useState(false);
  const [showAddTour, setShowAddTour] = React.useState(false);
  const [newPressTitle, setNewPressTitle] = React.useState("");
  const [newPressOutlet, setNewPressOutlet] = React.useState("");
  const [newPressUrl, setNewPressUrl] = React.useState("");
  const [newPressDate, setNewPressDate] = React.useState("");
  const [newHighlightTitle, setNewHighlightTitle] = React.useState("");
  const [newHighlightUrl, setNewHighlightUrl] = React.useState("");
  const [newTourDate, setNewTourDate] = React.useState("");
  const [newTourVenue, setNewTourVenue] = React.useState("");
  const [newTourCity, setNewTourCity] = React.useState("");
  const [newTourCountry, setNewTourCountry] = React.useState("");
  const [newTourTicket, setNewTourTicket] = React.useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = React.useState<{ type: string; id: string; name: string } | null>(null);

  /* ── Save ───────────────────────────────────────────────────── */
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = [
        { type: "TEXT", content: { section: "hero", ...hero }, order: 0 },
        { type: "LINK", content: { items: links }, order: 1 },
        { type: "AUDIO", content: { items: tracks }, order: 2 },
        { type: "VIDEO", content: { items: videos }, order: 3 },
        { type: "IMAGE", content: { items: gallery }, order: 4 },
        { type: "TEXT", content: { section: "bio", ...bio }, order: 5 },
        { type: "CONTACT", content: { ...contact }, order: 6 },
        { type: "GRID", content: { section: "extras", press, highlights, tours }, order: 7 },
      ];
      const res = await fetch(`/api/editor/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: payload }),
      });
      if (res.ok) { setLastSaved(new Date().toLocaleTimeString()); setDirty(false); }
    } finally { setSaving(false); }
  };

  /* ── Handlers ──────────────────────────────────────────────── */
  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    if (type === "link") setLinks((p) => p.filter((x) => x.id !== id));
    if (type === "track") setTracks((p) => p.filter((x) => x.id !== id));
    if (type === "video") setVideos((p) => p.filter((x) => x.id !== id));
    if (type === "gallery") setGallery((p) => p.filter((x) => x.id !== id));
    if (type === "press") setPress((p) => p.filter((x) => x.id !== id));
    if (type === "highlight") setHighlights((p) => p.filter((x) => x.id !== id));
    if (type === "tour") setTours((p) => p.filter((x) => x.id !== id));
    setDeleteTarget(null); markDirty();
  }

  const actionButtons = (
    <>
      <Button variant="secondary" onClick={() => window.open(`/${page.handle}`, "_blank")} className="py-2 px-4 shadow-sm text-xs rounded-xl cursor-pointer whitespace-nowrap">
        <Eye size={14} className="mr-1.5" /> Preview
      </Button>
      <Button variant="primary" onClick={handleSave} disabled={saving || !dirty} className="py-2 px-5 shadow-sm text-sm rounded-xl cursor-pointer border-none text-white whitespace-nowrap">
        {saving ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Saving…</> : <><Save size={14} className="mr-1.5" /> Save Changes</>}
      </Button>
    </>
  );

  function addLink() {
    if (!newLinkUrl.trim()) return;
    const meta = STREAMING_PLATFORMS.find((p) => p.value === newLinkPlatform);
    setLinks((p) => [...p, { id: uid(), platform: newLinkPlatform, url: newLinkUrl.trim(), label: meta?.label || "Link" }]);
    setNewLinkUrl(""); setShowAddLink(false); markDirty();
  }

  function addTrack() {
    if (!newTrackTitle.trim()) return;
    setTracks((p) => [...p, { id: uid(), title: newTrackTitle.trim(), duration: newTrackDuration.trim(), url: newTrackUrl.trim(), coverArt: "" }]);
    setNewTrackTitle(""); setNewTrackDuration(""); setNewTrackUrl(""); setShowAddTrack(false); markDirty();
  }

  // Extract audio metadata + convert to data URL for playback
  async function handleAudioUpload(file: File) {
    setTrackUploading(true);
    const title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    let duration = "";
    try {
      const objUrl = URL.createObjectURL(file);
      const audio = new Audio(objUrl);
      await new Promise<void>((resolve) => { audio.onloadedmetadata = () => resolve(); audio.onerror = () => resolve(); });
      if (audio.duration && isFinite(audio.duration)) {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        duration = `${mins}:${secs.toString().padStart(2, "0")}`;
      }
      URL.revokeObjectURL(objUrl);
    } catch {}
    const uploaded = await uploadAssetFile(file, { kind: "audio", pageId: page.id });
    setNewTrackTitle(title);
    setNewTrackDuration(duration);
    setNewTrackUrl(uploaded.secureUrl);
    setShowAddTrack(true);
    setTrackUploading(false);
  }

  // Batch upload audio files with data URL storage
  async function handleAudioBatchUpload(files: File[]) {
    for (const file of files) {
      const title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      let duration = "";
      try {
        const objUrl = URL.createObjectURL(file);
        const audio = new Audio(objUrl);
        await new Promise<void>((resolve) => { audio.onloadedmetadata = () => resolve(); audio.onerror = () => resolve(); });
        if (audio.duration && isFinite(audio.duration)) {
          const mins = Math.floor(audio.duration / 60);
          const secs = Math.floor(audio.duration % 60);
          duration = `${mins}:${secs.toString().padStart(2, "0")}`;
        }
        URL.revokeObjectURL(objUrl);
      } catch {}
      const uploaded = await uploadAssetFile(file, { kind: "audio", pageId: page.id });
      setTracks((p) => [...p, { id: uid(), title, duration, url: uploaded.secureUrl, coverArt: "" }]);
    }
    markDirty();
  }

  function addVideo() {
    if (!newVideoUrl.trim()) return;
    setVideos((p) => [...p, { id: uid(), title: newVideoTitle.trim() || "Untitled Video", url: newVideoUrl.trim() }]);
    setNewVideoTitle(""); setNewVideoUrl(""); setShowAddVideo(false); markDirty();
  }

  function addPress() {
    if (!newPressTitle.trim()) return;
    setPress((p) => [...p, { id: uid(), title: newPressTitle.trim(), outlet: newPressOutlet.trim(), url: newPressUrl.trim(), date: newPressDate }]);
    setNewPressTitle(""); setNewPressOutlet(""); setNewPressUrl(""); setNewPressDate(""); setShowAddPress(false); markDirty();
  }
  function addHighlight() {
    if (!newHighlightTitle.trim()) return;
    setHighlights((p) => [...p, { id: uid(), title: newHighlightTitle.trim(), url: newHighlightUrl.trim() }]);
    setNewHighlightTitle(""); setNewHighlightUrl(""); setShowAddHighlight(false); markDirty();
  }
  function addTour() {
    if (!newTourVenue.trim() || !newTourDate) return;
    setTours((p) => [...p, { id: uid(), date: newTourDate, venue: newTourVenue.trim(), city: newTourCity.trim(), country: newTourCountry.trim(), ticketUrl: newTourTicket.trim(), status: "upcoming" }]);
    setNewTourDate(""); setNewTourVenue(""); setNewTourCity(""); setNewTourCountry(""); setNewTourTicket(""); setShowAddTour(false); markDirty();
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">

      {/* Toolbar */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-primary text-sm font-semibold">
          <Music size={18} />
          <span>EPK Editor</span>
          {lastSaved && <span className="text-text-secondary font-normal">· Saved at {lastSaved}</span>}
          {dirty && !saving && <span className="text-warning font-normal">· Unsaved changes</span>}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          {actionButtons}
        </div>
      </div>

      {/* ══════════════ HERO SECTION ══════════════ */}
      <Card className="rounded-3xl border border-divider shadow-premium bg-surface p-0 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
        <div className="p-6 sm:p-8 pt-8 space-y-6">
          <h3 className="font-bold text-xl text-text-primary tracking-tight">Artist Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input labelInside="Artist / Band Name" placeholder="e.g. The Midnight" value={hero.artistName} onChange={(e) => { setHero((h) => ({ ...h, artistName: e.target.value })); markDirty(); }} />
            <Input labelInside="Genre" placeholder="e.g. Synthwave / Electronic" value={hero.genre} onChange={(e) => { setHero((h) => ({ ...h, genre: e.target.value })); markDirty(); }} />
          </div>
          <Input labelInside="Tagline" placeholder="A one-liner that defines your sound" value={hero.tagline} onChange={(e) => { setHero((h) => ({ ...h, tagline: e.target.value })); markDirty(); }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dropzone label="Profile Photo" hint="Square image, min 400×400" accept="image/*" onChange={async (f) => { const uploaded = await uploadAssetFile(f, { kind: "image", pageId: page.id }); setHero((h) => ({ ...h, profileImage: uploaded.secureUrl })); markDirty(); }} />
            <Dropzone label="Cover / Banner Image" hint="Landscape, min 1200×400" accept="image/*" onChange={async (f) => { const uploaded = await uploadAssetFile(f, { kind: "image", pageId: page.id }); setHero((h) => ({ ...h, coverImage: uploaded.secureUrl })); markDirty(); }} />
          </div>
          {(hero.profileImage || hero.coverImage) && (
            <div className="flex gap-3 flex-wrap">
              {hero.profileImage && <Image src={hero.profileImage} alt="Profile" width={64} height={64} unoptimized className="h-16 w-16 rounded-xl object-cover border border-divider" />}
              {hero.coverImage && <Image src={hero.coverImage} alt="Cover" width={200} height={64} unoptimized className="h-16 max-w-[200px] rounded-xl object-cover border border-divider" />}
            </div>
          )}
        </div>
      </Card>

      {/* ══════════════ STREAMING LINKS ══════════════ */}
      <Card className="rounded-3xl border border-divider shadow-sm bg-surface p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-text-primary tracking-tight">Streaming & Music Links</h3>
          <Button variant="ghost" onClick={() => setShowAddLink(true)} className="text-primary text-xs font-bold py-1.5 px-3 rounded-lg h-auto hover:bg-primary/5 cursor-pointer border border-primary/20">
            <Plus size={14} className="mr-1" /> Add Link
          </Button>
        </div>
        {links.length === 0 ? (
          <div className="bg-background border-2 border-dashed border-divider rounded-xl p-6 text-center">
            <LinkIcon size={28} className="text-text-secondary mx-auto mb-2 opacity-30" />
            <p className="text-sm text-text-secondary font-semibold">No streaming links yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => {
              const meta = STREAMING_PLATFORMS.find((p) => p.value === link.platform);
              return (
                <div key={link.id} className="bg-background border border-divider rounded-xl p-3 flex items-center gap-3">
                  <Badge variant={meta?.color.includes("success") ? "success" : meta?.color.includes("error") ? "error" : meta?.color.includes("warning") ? "warning" : "primary"} className="text-[10px] shrink-0">{meta?.label}</Badge>
                  <span className="flex-1 text-xs font-semibold text-text-primary truncate min-w-0">{link.url}</span>
                  <IconButton variant="danger" size="sm" onClick={() => setDeleteTarget({ type: "link", id: link.id, name: meta?.label || "link" })}><Trash2 className="w-3.5 h-3.5" /></IconButton>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ══════════════ TRACKS ══════════════ */}
      <Card className="rounded-3xl border border-divider shadow-sm bg-surface p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-text-primary tracking-tight">Track List</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => { setNewTrackTitle(""); setNewTrackDuration(""); setNewTrackUrl(""); setShowAddTrack(true); }} className="text-primary text-xs font-bold py-1.5 px-3 rounded-lg h-auto hover:bg-primary/5 cursor-pointer border border-primary/20">
              <Plus size={14} className="mr-1" /> Manual
            </Button>
          </div>
        </div>
        <Dropzone hint="Drop audio files to auto-detect title & duration (MP3, WAV, FLAC)" accept="audio/*" multiple onMultiple={handleAudioBatchUpload} onChange={handleAudioUpload} />
        {trackUploading && <p className="text-xs text-primary font-semibold animate-pulse">Reading audio metadata…</p>}
        {tracks.length === 0 ? (
          <div className="bg-background border-2 border-dashed border-divider rounded-xl p-6 text-center">
            <Music size={28} className="text-text-secondary mx-auto mb-2 opacity-30" />
            <p className="text-sm text-text-secondary font-semibold">No tracks added yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tracks.map((track, i) => (
              <div key={track.id} className="bg-background border border-divider rounded-xl p-3 flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">{track.title}</p>
                  {track.duration && <p className="text-[10px] text-text-secondary">{track.duration}</p>}
                </div>
                {track.url && <a href={track.url.startsWith("http") ? track.url : `https://${track.url}`} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary"><ExternalLink className="w-3.5 h-3.5" /></a>}
                <IconButton variant="danger" size="sm" onClick={() => setDeleteTarget({ type: "track", id: track.id, name: track.title })}><Trash2 className="w-3.5 h-3.5" /></IconButton>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ══════════════ VIDEOS ══════════════ */}
      <Card className="rounded-3xl border border-divider shadow-sm bg-surface p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-text-primary tracking-tight">Videos</h3>
          <Button variant="ghost" onClick={() => setShowAddVideo(true)} className="text-primary text-xs font-bold py-1.5 px-3 rounded-lg h-auto hover:bg-primary/5 cursor-pointer border border-primary/20">
            <Plus size={14} className="mr-1" /> Add Video
          </Button>
        </div>
        {videos.length === 0 ? (
          <div className="bg-background border-2 border-dashed border-divider rounded-xl p-6 text-center">
            <Video size={28} className="text-text-secondary mx-auto mb-2 opacity-30" />
            <p className="text-sm text-text-secondary font-semibold">No videos added yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {videos.map((vid) => (
              <div key={vid.id} className="bg-background border border-divider rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0"><Video className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">{vid.title}</p>
                  <p className="text-[10px] text-text-secondary truncate">{vid.url}</p>
                </div>
                <IconButton variant="danger" size="sm" onClick={() => setDeleteTarget({ type: "video", id: vid.id, name: vid.title })}><Trash2 className="w-3.5 h-3.5" /></IconButton>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ══════════════ GALLERY ══════════════ */}
      <Card className="rounded-3xl border border-divider shadow-sm bg-surface p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-xl text-text-primary tracking-tight">Press Photos</h3>
        {gallery.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gallery.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-divider bg-background">
                <Image src={img.src} alt={img.caption} width={320} height={128} unoptimized className="h-32 w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <IconButton variant="danger" size="md" onClick={() => setDeleteTarget({ type: "gallery", id: img.id, name: img.caption })} className="bg-surface/80">
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </div>
                <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-2 py-1 truncate">{img.caption}</p>
              </div>
            ))}
          </div>
        )}
        <Dropzone hint="Add more press photos — select multiple or drag & drop" accept="image/*" multiple onMultiple={async (files) => { for (const f of files) { const uploaded = await uploadAssetFile(f, { kind: "image", pageId: page.id }); setGallery((p) => [...p, { id: uid(), src: uploaded.secureUrl, caption: f.name }]); } markDirty(); }} />
      </Card>

      {/* ══════════════ PRESS COVERAGE ══════════════ */}
      <Card className="rounded-3xl border border-divider shadow-sm bg-surface p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-text-primary tracking-tight">Press Coverage</h3>
          <Button variant="ghost" onClick={() => setShowAddPress(true)} className="text-primary text-xs font-bold py-1.5 px-3 rounded-lg h-auto hover:bg-primary/5 cursor-pointer border border-primary/20">
            <Plus size={14} className="mr-1" /> Add Feature
          </Button>
        </div>
        {press.length === 0 ? (
          <div className="bg-background border-2 border-dashed border-divider rounded-xl p-6 text-center">
            <Newspaper size={28} className="text-text-secondary mx-auto mb-2 opacity-30" />
            <p className="text-sm text-text-secondary font-semibold">No press features added yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {press.map((p) => (
              <div key={p.id} className="bg-background border border-divider rounded-xl p-3 flex items-center gap-3">
                <Newspaper className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">{p.title}</p>
                  <p className="text-[10px] text-text-secondary truncate">{p.outlet}{p.date ? ` · ${p.date}` : ""}</p>
                </div>
                <IconButton variant="danger" size="sm" onClick={() => setDeleteTarget({ type: "press", id: p.id, name: p.title })}><Trash2 className="w-3.5 h-3.5" /></IconButton>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ══════════════ HIGHLIGHTS ══════════════ */}
      <Card className="rounded-3xl border border-divider shadow-sm bg-surface p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-text-primary tracking-tight">Highlights & Achievements</h3>
          <Button variant="ghost" onClick={() => setShowAddHighlight(true)} className="text-primary text-xs font-bold py-1.5 px-3 rounded-lg h-auto hover:bg-primary/5 cursor-pointer border border-primary/20">
            <Plus size={14} className="mr-1" /> Add
          </Button>
        </div>
        {highlights.length === 0 ? (
          <div className="bg-background border-2 border-dashed border-divider rounded-xl p-6 text-center">
            <Award size={28} className="text-text-secondary mx-auto mb-2 opacity-30" />
            <p className="text-sm text-text-secondary font-semibold">No highlights added yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {highlights.map((h) => (
              <div key={h.id} className="bg-background border border-divider rounded-xl p-3 flex items-center gap-3">
                <Award className="w-4 h-4 text-warning shrink-0" />
                <span className="flex-1 text-xs font-bold text-text-primary truncate">{h.title}</span>
                <IconButton variant="danger" size="sm" onClick={() => setDeleteTarget({ type: "highlight", id: h.id, name: h.title })}><Trash2 className="w-3.5 h-3.5" /></IconButton>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ══════════════ TOURS / EVENTS ══════════════ */}
      <Card className="rounded-3xl border border-divider shadow-sm bg-surface p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-text-primary tracking-tight">Tours & Events</h3>
          <Button variant="ghost" onClick={() => setShowAddTour(true)} className="text-primary text-xs font-bold py-1.5 px-3 rounded-lg h-auto hover:bg-primary/5 cursor-pointer border border-primary/20">
            <Plus size={14} className="mr-1" /> Add Event
          </Button>
        </div>
        {tours.length === 0 ? (
          <div className="bg-background border-2 border-dashed border-divider rounded-xl p-6 text-center">
            <Calendar size={28} className="text-text-secondary mx-auto mb-2 opacity-30" />
            <p className="text-sm text-text-secondary font-semibold">No events added yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tours.map((t) => (
              <div key={t.id} className="bg-background border border-divider rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold leading-none">{new Date(t.date).toLocaleDateString(undefined, { month: "short" }).toUpperCase()}</span>
                  <span className="text-sm font-bold leading-none">{new Date(t.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">{t.venue}</p>
                  <p className="text-[10px] text-text-secondary truncate">{t.city}{t.country ? `, ${t.country}` : ""}</p>
                </div>
                <Badge variant={TOUR_STATUS_META[t.status]?.variant || "neutral"} className="text-[9px] shrink-0">{TOUR_STATUS_META[t.status]?.label}</Badge>
                <IconButton variant="danger" size="sm" onClick={() => setDeleteTarget({ type: "tour", id: t.id, name: t.venue })}><Trash2 className="w-3.5 h-3.5" /></IconButton>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ══════════════ BIO ══════════════ */}
      <Card className="rounded-3xl border border-divider shadow-sm bg-surface p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-xl text-text-primary tracking-tight">Biography</h3>
        <Textarea label="Artist Bio" placeholder="Write a press-ready biography. This will appear on your public EPK…" rows={6} value={bio.text} onChange={(e) => { setBio((b) => ({ ...b, text: e.target.value })); markDirty(); }} />
        <Input labelInside="Press Kit PDF (URL)" placeholder="https://drive.google.com/your-press-kit.pdf" value={bio.pressKitUrl} onChange={(e) => { setBio((b) => ({ ...b, pressKitUrl: e.target.value })); markDirty(); }} />
      </Card>

      {/* ══════════════ CONTACT ══════════════ */}
      <Card className="rounded-3xl border border-divider shadow-sm bg-surface p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-xl text-text-primary tracking-tight">Contact & Booking</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input labelInside="Booking Email" placeholder="booking@artist.com" value={contact.email} onChange={(e) => { setContact((c) => ({ ...c, email: e.target.value })); markDirty(); }} />
          <Input labelInside="Phone" placeholder="+1 555 000 0000" value={contact.phone} onChange={(e) => { setContact((c) => ({ ...c, phone: e.target.value })); markDirty(); }} />
          <Input labelInside="Management Name" placeholder="e.g. Big Agency Inc." value={contact.managementName} onChange={(e) => { setContact((c) => ({ ...c, managementName: e.target.value })); markDirty(); }} />
          <Input labelInside="Management Email" placeholder="mgmt@agency.com" value={contact.managementEmail} onChange={(e) => { setContact((c) => ({ ...c, managementEmail: e.target.value })); markDirty(); }} />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-text-secondary">Social Links</p>
          {SOCIAL_PLATFORMS.map((platform) => (
            <Input key={platform} labelInside={platform.charAt(0).toUpperCase() + platform.slice(1)} placeholder={`https://${platform}.com/yourprofile`} value={contact.socials[platform] || ""} onChange={(e) => { setContact((c) => ({ ...c, socials: { ...c.socials, [platform]: e.target.value } })); markDirty(); }} />
          ))}
        </div>
      </Card>

      {/* ══════════════ MODALS ══════════════ */}
      <Modal isOpen={showAddLink} onClose={() => setShowAddLink(false)} title="Add Streaming Link" description="Add a link to your music on any platform." icon="info">
        <div className="w-full space-y-3 !mt-4">
          <Select label="Platform" options={STREAMING_PLATFORMS.map((p) => ({ label: p.label, value: p.value }))} value={newLinkPlatform} onChange={(e) => setNewLinkPlatform(e.target.value as StreamingPlatform)} />
          <Input icon={<LinkIcon className="w-4 h-4" />} placeholder="https://open.spotify.com/artist/..." value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowAddLink(false)}>Cancel</Button>
            <Button variant="primary" onClick={addLink} disabled={!newLinkUrl.trim()}>Add Link</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAddTrack} onClose={() => setShowAddTrack(false)} title="Add Track" description="Add a track to your EPK." icon="info">
        <div className="w-full space-y-3 !mt-4">
          <Input placeholder="Track title" value={newTrackTitle} onChange={(e) => setNewTrackTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Duration (e.g. 3:42)" value={newTrackDuration} onChange={(e) => setNewTrackDuration(e.target.value)} />
            <Input icon={<LinkIcon className="w-4 h-4" />} placeholder="Link to track" value={newTrackUrl} onChange={(e) => setNewTrackUrl(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowAddTrack(false)}>Cancel</Button>
            <Button variant="primary" onClick={addTrack} disabled={!newTrackTitle.trim()}>Add Track</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAddVideo} onClose={() => setShowAddVideo(false)} title="Add Video" description="Paste a YouTube or Vimeo URL." icon="info">
        <div className="w-full space-y-3 !mt-4">
          <Input placeholder="Video title" value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)} />
          <Input icon={<Video className="w-4 h-4" />} placeholder="https://youtube.com/watch?v=..." value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowAddVideo(false)}>Cancel</Button>
            <Button variant="primary" onClick={addVideo} disabled={!newVideoUrl.trim()}>Add Video</Button>
          </div>
        </div>
      </Modal>

      {/* Press modal */}
      <Modal isOpen={showAddPress} onClose={() => setShowAddPress(false)} title="Add Press Feature" description="Link to an article or review about you." icon="info">
        <div className="w-full space-y-3 !mt-4">
          <Input placeholder="Article title" value={newPressTitle} onChange={(e) => setNewPressTitle(e.target.value)} />
          <Input placeholder="Publication (e.g. Rolling Stone)" value={newPressOutlet} onChange={(e) => setNewPressOutlet(e.target.value)} />
          <Input icon={<LinkIcon className="w-4 h-4" />} placeholder="https://..." value={newPressUrl} onChange={(e) => setNewPressUrl(e.target.value)} />
          <div className="w-full"><span className="text-sm font-semibold text-text-secondary mb-1 block">Date (optional)</span><input type="date" className="w-full input-base px-4 py-3 text-text-primary bg-background cursor-pointer" value={newPressDate} onChange={(e) => setNewPressDate(e.target.value)} /></div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowAddPress(false)}>Cancel</Button>
            <Button variant="primary" onClick={addPress} disabled={!newPressTitle.trim()}>Add Feature</Button>
          </div>
        </div>
      </Modal>

      {/* Highlight modal */}
      <Modal isOpen={showAddHighlight} onClose={() => setShowAddHighlight(false)} title="Add Highlight" description="Awards, milestones, or notable achievements." icon="info">
        <div className="w-full space-y-3 !mt-4">
          <Input placeholder="e.g. Grammy Nominated 2025" value={newHighlightTitle} onChange={(e) => setNewHighlightTitle(e.target.value)} />
          <Input icon={<LinkIcon className="w-4 h-4" />} placeholder="Link to post (optional)" value={newHighlightUrl} onChange={(e) => setNewHighlightUrl(e.target.value)} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowAddHighlight(false)}>Cancel</Button>
            <Button variant="primary" onClick={addHighlight} disabled={!newHighlightTitle.trim()}>Add Highlight</Button>
          </div>
        </div>
      </Modal>

      {/* Tour event modal */}
      <Modal isOpen={showAddTour} onClose={() => setShowAddTour(false)} title="Add Tour / Event" description="Add an upcoming or past show." icon="info">
        <div className="w-full space-y-3 !mt-4">
          <div className="w-full"><span className="text-sm font-semibold text-text-secondary mb-1 block">Event Date</span><input type="date" className="w-full input-base px-4 py-3 text-text-primary bg-background cursor-pointer" value={newTourDate} onChange={(e) => setNewTourDate(e.target.value)} /></div>
          <Input placeholder="Venue name" value={newTourVenue} onChange={(e) => setNewTourVenue(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="City" value={newTourCity} onChange={(e) => setNewTourCity(e.target.value)} />
            <Input placeholder="Country" value={newTourCountry} onChange={(e) => setNewTourCountry(e.target.value)} />
          </div>
          <Input icon={<LinkIcon className="w-4 h-4" />} placeholder="Ticket link (optional)" value={newTourTicket} onChange={(e) => setNewTourTicket(e.target.value)} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowAddTour(false)}>Cancel</Button>
            <Button variant="primary" onClick={addTour} disabled={!newTourVenue.trim() || !newTourDate}>Add Event</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} title="Delete Item" description={`Are you sure you want to delete "${deleteTarget?.name}"?`} />
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
