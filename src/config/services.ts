export const DEMO_ASSETS_ALLOWED =
  process.env.NEXT_PUBLIC_ALLOW_DEMO_ASSETS === "true" ||
  process.env.NODE_ENV !== "production";

export const NOMINATIM_BASE =
  process.env.NEXT_PUBLIC_NOMINATIM_URL ||
  (process.env.NODE_ENV !== "production" ? "https://nominatim.openstreetmap.org" : "");

export const QR_API_BASE =
  process.env.NEXT_PUBLIC_QR_API_URL ||
  (process.env.NODE_ENV !== "production" ? "https://api.qrserver.com" : "");

export const YOUTUBE_EMBED_BASE = "https://www.youtube.com/embed";
export const VIMEO_EMBED_BASE = "https://player.vimeo.com/video";
