import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges CSS classes safely using clsx and tailwind-merge.
 * Essential for atomic components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the base URL for the application, dynamically checking environment variables or current window origin.
 */
export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const url = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  if (url) return url;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  return "";
}
