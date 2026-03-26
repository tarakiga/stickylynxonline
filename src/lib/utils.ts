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

export function currencySymbol(code?: string) {
  const c = (code || "USD").toUpperCase();
  const map: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", CNY: "¥", INR: "₹", NGN: "₦", GHS: "₵", ZAR: "R",
    KES: "KSh", UGX: "USh", TZS: "TSh", CAD: "$", AUD: "$", NZD: "$", CHF: "CHF", SEK: "kr",
    NOK: "kr", DKK: "kr", PLN: "zł", CZK: "Kč", HUF: "Ft", RUB: "₽", TRY: "₺", AED: "د.إ",
    SAR: "﷼", QAR: "﷼", BHD: ".د.ب", OMR: "﷼", PKR: "₨", LKR: "Rs", THB: "฿", SGD: "$",
    HKD: "$", MYR: "RM", IDR: "Rp", PHP: "₱", BRL: "R$", MXN: "$", ARS: "$", CLP: "$", COP: "$",
  };
  return map[c] || c;
}
