import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges CSS classes safely using clsx and tailwind-merge.
 * Essential for atomic components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
