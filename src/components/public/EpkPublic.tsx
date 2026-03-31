"use client";
import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { EpkHero, StreamingLink, EpkTrack, EpkVideo, EpkGalleryImage, EpkBio, EpkContact, PressFeature, Highlight, TourEvent } from "@/types/epk";
import { STREAMING_PLATFORMS, SOCIAL_PLATFORMS, TOUR_STATUS_META } from "@/types/epk";
import { YOUTUBE_EMBED_BASE, VIMEO_EMBED_BASE } from "@/config/services";
import type { EditorPage } from "@/types/editor-page";
import { findEditorBlock } from "@/types/editor-page";
import {
  Music, ExternalLink, Video, Download, Mail, Phone, Globe, X,
  Newspaper, Award, MapPin, Ticket,
} from "lucide-react";

function ensureProtocol(url: string): string {
  if (!url) return "#";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `https://${url}`;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? `${YOUTUBE_EMBED_BASE}/${match[1]}` : null;
}

function getVimeoEmbedUrl(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `${VIMEO_EMBED_BASE}/${match[1]}` : null;
}

type EpkItemsBlock<T> = {
  items?: T[]
}

type EpkGridBlock = {
  press?: PressFeature[]
  highlights?: Highlight[]
  tours?: TourEvent[]
}

export function EpkPublic({ page }: { page: EditorPage }) {
  const blocks = page.blocks || [];
  const heroData = (findEditorBlock(blocks, "TEXT", "hero")?.content || {}) as Partial<EpkHero>;
  const linksData = (findEditorBlock(blocks, "LINK")?.content || {}) as EpkItemsBlock<StreamingLink>;
  const audioData = (findEditorBlock(blocks, "AUDIO")?.content || {}) as EpkItemsBlock<EpkTrack>;
  const videoData = (findEditorBlock(blocks, "VIDEO")?.content || {}) as EpkItemsBlock<EpkVideo>;
  const imageData = (findEditorBlock(blocks, "IMAGE")?.content || {}) as EpkItemsBlock<EpkGalleryImage>;
  const bioData = (findEditorBlock(blocks, "TEXT", "bio")?.content || {}) as Partial<EpkBio>;
  const contactData = (findEditorBlock(blocks, "CONTACT")?.content || {}) as Partial<EpkContact>;
  const gridData = (findEditorBlock(blocks, "GRID")?.content || {}) as EpkGridBlock;

  const hero: EpkHero = { artistName: heroData.artistName || page.title || "Artist", tagline: heroData.tagline || "", genre: heroData.genre || "", profileImage: heroData.profileImage || "", coverImage: heroData.coverImage || "" };
  const links: StreamingLink[] = linksData.items || [];
  const tracks: EpkTrack[] = audioData.items || [];
  const videos: EpkVideo[] = videoData.items || [];
  const gallery: EpkGalleryImage[] = imageData.items || [];
  const bio: EpkBio = { text: bioData.text || "", pressKitUrl: bioData.pressKitUrl || "" };
  const contact: EpkContact = { email: contactData.email || "", phone: contactData.phone || "", managementName: contactData.managementName || "", managementEmail: contactData.managementEmail || "", socials: contactData.socials || {} };
  const press: PressFeature[] = gridData.press || [];
  const highlights: Highlight[] = gridData.highlights || [];
  const tours: TourEvent[] = gridData.tours || [];

  const [lightboxImg, setLightboxImg] = React.useState<string | null>(null);

  const hasSocials = Object.values(contact.socials).some((v) => v);

  return (
    <div className="min-h-screen bg-background text-text-primary">

      {/* ══════════════ HERO ══════════════ */}
      <div className="relative">
        {/* Cover with dark gradient overlay for text contrast */}
        <div className="w-full h-48 sm:h-64 md:h-80 bg-gradient-to-br from-primary via-secondary to-accent overflow-hidden relative">
          {hero.coverImage && <img src={hero.coverImage} alt="Cover" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Artist name over the dark gradient — always white */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-8 sm:pb-10">
          <div className="max-w-screen-md mx-auto px-4 flex flex-col sm:flex-row items-center sm:items-end gap-2">
            <div className="hidden sm:block w-36 shrink-0" />{/* spacer for profile photo width */}
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-lg">{hero.artistName}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Profile photo + meta below cover */}
      <div className="max-w-screen-md mx-auto px-4 -mt-16 sm:-mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-surface bg-surface shadow-premium overflow-hidden shrink-0">
            {hero.profileImage ? (
              <img src={hero.profileImage} alt={hero.artistName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-4xl">
                {hero.artistName.substring(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-center sm:text-left pb-2 pt-16 sm:pt-20">
            {hero.genre && <Badge variant="primary" className="text-xs mb-1">{hero.genre}</Badge>}
            {hero.tagline && <p className="text-text-secondary text-sm mt-2 max-w-md">{hero.tagline}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-screen-md mx-auto px-4 py-8 pb-32 space-y-8">

        {/* ══════════════ STREAMING LINKS ══════════════ */}
        {links.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {links.map((link) => {
              const meta = STREAMING_PLATFORMS.find((p) => p.value === link.platform);
              return (
                <a
                  key={link.id}
                  href={ensureProtocol(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-surface border border-divider px-4 py-2.5 rounded-full text-xs font-bold text-text-primary hover:border-primary/50 hover:text-primary transition-all shadow-sm"
                >
                  <Music className="w-3.5 h-3.5" />
                  {meta?.label || link.label}
                  <ExternalLink className="w-3 h-3 opacity-40" />
                </a>
              );
            })}
          </div>
        )}

        {/* ══════════════ TRACKS ══════════════ */}
        {tracks.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-bold text-lg text-text-primary tracking-tight">Music</h2>
            <div className="space-y-3">
              {tracks.map((track, i) => {
                const isAudioData = track.url?.startsWith("data:audio");
                const isPlayableUrl = track.url && (track.url.endsWith(".mp3") || track.url.endsWith(".wav") || track.url.endsWith(".ogg") || isAudioData);
                return (
                  <div key={track.id} className="bg-surface border border-divider rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-text-primary truncate">{track.title}</h4>
                        {track.duration && <p className="text-[10px] text-text-secondary">{track.duration}</p>}
                      </div>
                      {track.url && !isPlayableUrl && (
                        <a href={ensureProtocol(track.url)} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    {isPlayableUrl && (
                      <div className="px-4 pb-3">
                        <audio controls preload="metadata" className="w-full h-8 rounded-lg" style={{ colorScheme: "light" }}>
                          <source src={track.url} />
                        </audio>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══════════════ VIDEOS ══════════════ */}
        {videos.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-bold text-lg text-text-primary tracking-tight">Videos</h2>
            <div className="space-y-4">
              {videos.map((vid) => {
                const ytEmbed = getYouTubeEmbedUrl(vid.url);
                const vimeoEmbed = getVimeoEmbedUrl(vid.url);
                const embedUrl = ytEmbed || vimeoEmbed;
                return (
                  <div key={vid.id} className="space-y-2">
                    {embedUrl ? (
                      <div className="rounded-2xl overflow-hidden border border-divider shadow-sm bg-black aspect-video">
                        <iframe
                          src={embedUrl}
                          title={vid.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <a href={ensureProtocol(vid.url)} target="_blank" rel="noopener noreferrer" className="bg-surface border border-divider rounded-2xl p-4 flex items-center gap-3 hover:border-primary/50 transition-colors shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0"><Video className="w-5 h-5" /></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-text-primary truncate">{vid.title}</h4>
                          <p className="text-[10px] text-text-secondary truncate">{vid.url}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-text-secondary shrink-0" />
                      </a>
                    )}
                    <p className="text-xs font-semibold text-text-primary px-1">{vid.title}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══════════════ GALLERY ══════════════ */}
        {gallery.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-bold text-lg text-text-primary tracking-tight">Press Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((img) => (
                <div key={img.id} className="rounded-xl overflow-hidden border border-divider bg-background cursor-pointer group" onClick={() => setLightboxImg(img.src)}>
                  <img src={img.src} alt={img.caption} className="w-full h-36 sm:h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════ HIGHLIGHTS ══════════════ */}
        {highlights.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-bold text-lg text-text-primary tracking-tight">Highlights & Achievements</h2>
            <div className="flex flex-wrap gap-2">
              {highlights.map((h) => (
                h.url ? (
                  <a key={h.id} href={ensureProtocol(h.url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-warning/5 border border-warning/20 px-4 py-2.5 rounded-full text-xs font-bold text-text-primary hover:border-warning/50 transition-all shadow-sm">
                    <Award className="w-3.5 h-3.5 text-warning" /> {h.title} <ExternalLink className="w-3 h-3 opacity-40" />
                  </a>
                ) : (
                  <span key={h.id} className="inline-flex items-center gap-2 bg-warning/5 border border-warning/20 px-4 py-2.5 rounded-full text-xs font-bold text-text-primary shadow-sm">
                    <Award className="w-3.5 h-3.5 text-warning" /> {h.title}
                  </span>
                )
              ))}
            </div>
          </section>
        )}

        {/* ══════════════ TOURS / EVENTS ══════════════ */}
        {tours.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-bold text-lg text-text-primary tracking-tight">Tours & Events</h2>
            <div className="space-y-3">
              {tours.map((t) => {
                const meta = TOUR_STATUS_META[t.status] || TOUR_STATUS_META.upcoming;
                return (
                  <div key={t.id} className="bg-surface border border-divider rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:border-primary/30 transition-colors">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold leading-none uppercase">{new Date(t.date).toLocaleDateString(undefined, { month: "short" })}</span>
                      <span className="text-xl font-bold leading-none mt-0.5">{new Date(t.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-text-primary truncate">{t.venue}</h4>
                      <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {t.city}{t.country ? `, ${t.country}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={meta.variant} className="text-[9px]">{meta.label}</Badge>
                      {t.ticketUrl && t.status === "upcoming" && (
                        <a href={ensureProtocol(t.ticketUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                          <Ticket className="w-3 h-3" /> Tickets
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══════════════ PRESS COVERAGE ══════════════ */}
        {press.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-bold text-lg text-text-primary tracking-tight">Press Coverage</h2>
            <div className="space-y-2">
              {press.map((p) => (
                <a key={p.id} href={p.url ? ensureProtocol(p.url) : undefined} target="_blank" rel="noopener noreferrer" className="bg-surface border border-divider rounded-2xl p-4 flex items-center gap-3 hover:border-primary/50 transition-colors shadow-sm group">
                  <Newspaper className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-text-primary truncate group-hover:text-primary transition-colors">{p.title}</h4>
                    <p className="text-[10px] text-text-secondary truncate">{p.outlet}{p.date ? ` · ${p.date}` : ""}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-text-secondary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════ BIO ══════════════ */}
        {bio.text && (
          <section className="space-y-4">
            <h2 className="font-bold text-lg text-text-primary tracking-tight">About</h2>
            <Card className="rounded-2xl p-6 bg-surface shadow-sm">
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{bio.text}</p>
            </Card>
            {bio.pressKitUrl && (
              <a href={ensureProtocol(bio.pressKitUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline">
                <Download className="w-3.5 h-3.5" /> Download Press Kit (PDF)
              </a>
            )}
          </section>
        )}

        {/* ══════════════ CONTACT ══════════════ */}
        {(contact.email || contact.managementEmail || hasSocials) && (
          <section className="space-y-4">
            <h2 className="font-bold text-lg text-text-primary tracking-tight">Contact & Booking</h2>
            <Card className="rounded-2xl p-6 bg-surface shadow-sm space-y-4">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-sm text-text-primary hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 text-primary shrink-0" /> {contact.email}
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-3 text-sm text-text-primary hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 text-primary shrink-0" /> {contact.phone}
                </a>
              )}
              {(contact.managementName || contact.managementEmail) && (
                <div className="pt-3 border-t border-divider">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Management</p>
                  {contact.managementName && <p className="text-sm font-semibold text-text-primary">{contact.managementName}</p>}
                  {contact.managementEmail && <a href={`mailto:${contact.managementEmail}`} className="text-sm text-primary hover:underline">{contact.managementEmail}</a>}
                </div>
              )}
              {hasSocials && (
                <div className="pt-3 border-t border-divider flex flex-wrap gap-2">
                  {SOCIAL_PLATFORMS.map((p) => {
                    const url = contact.socials[p];
                    if (!url) return null;
                    return (
                      <a key={p} href={ensureProtocol(url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-background border border-divider px-3 py-1.5 rounded-full text-[10px] font-bold text-text-primary hover:border-primary/50 hover:text-primary transition-colors">
                        <Globe className="w-3 h-3" /> {p.charAt(0).toUpperCase() + p.slice(1)}
                      </a>
                    );
                  })}
                </div>
              )}
            </Card>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-8 pb-4">
          <p className="text-xs text-text-secondary font-bold tracking-[0.2em] uppercase opacity-50">Powered by Stickylynx</p>
        </footer>
      </div>

      {/* Gallery lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setLightboxImg(null)}>
          <div className="relative max-w-3xl w-full max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightboxImg(null)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface border border-divider shadow-sm flex items-center justify-center text-text-secondary hover:text-error transition-colors cursor-pointer z-10">
              <X className="w-4 h-4" />
            </button>
            <img src={lightboxImg} alt="Press photo" className="w-full max-h-[85vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
