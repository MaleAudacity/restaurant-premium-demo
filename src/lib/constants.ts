import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarDays,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  MessageCircleMore,
  Settings,
  Sparkles,
  Bike,
  UtensilsCrossed,
} from "lucide-react";

export const DEFAULT_RESTAURANT_SLUG =
  process.env.DEMO_RESTAURANT_SLUG ?? "mirch-masala";

export type UserRole = "OWNER" | "MANAGER" | "KITCHEN" | "DELIVERY";

// Routes each role is permitted to reach. Prefix matching is used in middleware.
export const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  OWNER:    ["/"],
  MANAGER:  ["/"],
  KITCHEN:  ["/dashboard", "/kitchen"],
  DELIVERY: ["/dashboard", "/delivery"],
};

// Where to redirect after login (or after an unauthorized route attempt).
export const ROLE_HOME: Record<UserRole, string> = {
  OWNER:    "/dashboard",
  MANAGER:  "/dashboard",
  KITCHEN:  "/kitchen",
  DELIVERY: "/delivery",
};

export const dashboardNavigation: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
  allowedRoles: UserRole[];
}> = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard, allowedRoles: ["OWNER", "MANAGER", "KITCHEN", "DELIVERY"] },
  { href: "/orders",      label: "Orders",       icon: ClipboardList,   allowedRoles: ["OWNER", "MANAGER"] },
  { href: "/bookings",    label: "Bookings",     icon: CalendarDays,    allowedRoles: ["OWNER", "MANAGER"] },
  { href: "/events",      label: "Events",       icon: Sparkles,        allowedRoles: ["OWNER", "MANAGER"] },
  { href: "/kitchen",     label: "Kitchen",      icon: ChefHat,         allowedRoles: ["OWNER", "MANAGER", "KITCHEN"] },
  { href: "/delivery",         label: "Delivery",        icon: Bike,             allowedRoles: ["OWNER", "MANAGER", "DELIVERY"] },
  { href: "/analytics",        label: "Analytics",       icon: BarChart3,        allowedRoles: ["OWNER", "MANAGER"] },
  { href: "/menu-management",  label: "Menu",            icon: UtensilsCrossed,  allowedRoles: ["OWNER", "MANAGER"] },
  { href: "/settings",    label: "Settings",     icon: Settings,        allowedRoles: ["OWNER", "MANAGER"] },
  { href: "/demo/chat",   label: "Demo Chat",    icon: MessageCircleMore, allowedRoles: ["OWNER", "MANAGER"] },
];

export const publicNavigation = [
  { href: "/",              label: "Home" },
  { href: "/menu",          label: "Menu" },
  { href: "/book-table",    label: "Book Table" },
  { href: "/demo",          label: "Demo" },
  { href: "/whatsapp-order",label: "WhatsApp" },
  { href: "/about",         label: "About" },
  { href: "/contact",       label: "Contact" },
];
