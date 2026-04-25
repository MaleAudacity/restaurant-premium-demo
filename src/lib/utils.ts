import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type StatusTone = "amber" | "emerald" | "rose" | "stone";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountInPaise: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountInPaise / 100);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(typeof value === "string" ? new Date(value) : value);
}

export function formatDateOnly(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(typeof value === "string" ? new Date(value) : value);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getStatusTone(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("success") ||
    normalized.includes("ready") ||
    normalized.includes("delivered") ||
    normalized.includes("confirmed") ||
    normalized.includes("completed")
  ) {
    return "emerald" satisfies StatusTone;
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("preparing") ||
    normalized.includes("contacted") ||
    normalized.includes("quoted") ||
    normalized.includes("proposal")
  ) {
    return "amber" satisfies StatusTone;
  }

  if (
    normalized.includes("failed") ||
    normalized.includes("cancelled") ||
    normalized.includes("closed") ||
    normalized.includes("out_of_stock")
  ) {
    return "rose" satisfies StatusTone;
  }

  return "stone" satisfies StatusTone;
}
