/* ═══════════════════════════════════════════════════════════════
   EPK (Electronic Press Kit) — Shared Types
   ═══════════════════════════════════════════════════════════════ */

export interface EpkHero {
  artistName: string;
  tagline: string;
  genre: string;
  profileImage: string; // data URL or web URL
  coverImage: string;   // data URL or web URL
}

export type StreamingPlatform = "spotify" | "apple_music" | "youtube" | "soundcloud" | "tidal" | "bandcamp" | "other";

export interface StreamingLink {
  id: string;
  platform: StreamingPlatform;
  url: string;
  label: string;
}

export interface EpkTrack {
  id: string;
  title: string;
  duration: string; // e.g. "3:42"
  url: string;      // external link to the track
  coverArt: string; // data URL or web URL (optional)
}

export interface EpkVideo {
  id: string;
  title: string;
  url: string;      // YouTube or Vimeo URL
}

export interface EpkGalleryImage {
  id: string;
  src: string;      // data URL or web URL
  caption: string;
}

export interface EpkBio {
  text: string;
  pressKitUrl: string; // PDF download link or data URL
}

export interface EpkContact {
  email: string;
  phone: string;
  managementName: string;
  managementEmail: string;
  socials: Record<string, string>;
}

export interface PressFeature {
  id: string;
  title: string;
  outlet: string;
  url: string;
  date: string;
}

export interface Highlight {
  id: string;
  title: string;
  url: string;
}

export type TourEventStatus = "upcoming" | "sold_out" | "cancelled" | "past";

export interface TourEvent {
  id: string;
  date: string;
  venue: string;
  city: string;
  country: string;
  ticketUrl: string;
  status: TourEventStatus;
}

export const TOUR_STATUS_META: Record<TourEventStatus, { label: string; variant: "primary" | "success" | "error" | "neutral" }> = {
  upcoming:  { label: "Upcoming",  variant: "primary" },
  sold_out:  { label: "Sold Out",  variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
  past:      { label: "Past",      variant: "neutral" },
};

/* ─── Platform metadata for UI rendering ─────────────────────── */
export const STREAMING_PLATFORMS: { value: StreamingPlatform; label: string; color: string }[] = [
  { value: "spotify",      label: "Spotify",      color: "bg-success/10 text-success" },
  { value: "apple_music",  label: "Apple Music",  color: "bg-error/10 text-error" },
  { value: "youtube",      label: "YouTube",       color: "bg-error/10 text-error" },
  { value: "soundcloud",   label: "SoundCloud",   color: "bg-warning/10 text-warning" },
  { value: "tidal",        label: "Tidal",         color: "bg-primary/10 text-primary" },
  { value: "bandcamp",     label: "Bandcamp",     color: "bg-info/10 text-info" },
  { value: "other",        label: "Other",         color: "bg-divider text-text-secondary" },
];

export const SOCIAL_PLATFORMS = ["instagram", "twitter", "facebook", "tiktok", "website"] as const;
