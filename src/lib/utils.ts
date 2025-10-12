import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWalletAddress(address: string, length = 4): string {
  if (!address) return "";
  return `${address.substring(0, length)}...${address.substring(
    address.length - length
  )}`;
}

export function formatDate(date: string | Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString(undefined, options);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function calculateTimeLeft(endTime: string): string {
  const end = new Date(endTime);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function generateRandomGradient(): string {
  const hue1 = Math.floor(Math.random() * 360);
  const hue2 = (hue1 + 40 + Math.floor(Math.random() * 30)) % 360;
  return `linear-gradient(135deg, hsla(${hue1}, 70%, 60%, 0.8), hsla(${hue2}, 70%, 50%, 0.8))`;
}