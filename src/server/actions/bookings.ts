"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { BookingStatus, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isDatabaseReachable } from "@/lib/database-status";
import { getDemoSession } from "@/lib/demo/auth";
import { DEFAULT_RESTAURANT_SLUG } from "@/lib/constants";
import { writeAuditLog } from "@/lib/audit";

type ActionResult = { success: true } | { success: false; error: string };

async function getRestaurant() {
  return prisma.restaurant.findUnique({ where: { slug: DEFAULT_RESTAURANT_SLUG } });
}

function generateRef(): string {
  return `BK-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ---------------------------------------------------------------------------
// Public: create booking
// ---------------------------------------------------------------------------

const BookingSchema = z.object({
  firstName: z.string().min(1, "Name required"),
  lastName: z.string().optional(),
  phone: z.string().min(10, "Valid phone required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  guestCount: z.coerce.number().int().min(1).max(50),
  bookingDate: z.string().min(1, "Date required"),
  bookingTime: z.string().min(1, "Time required"),
  seatingPreference: z.string().optional(),
  specialOccasion: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateBookingResult =
  | { success: true; bookingReference: string }
  | { success: false; error: string };

export async function createBooking(input: z.infer<typeof BookingSchema>): Promise<CreateBookingResult> {
  if (!(await isDatabaseReachable())) return { success: false, error: "Database unavailable. Try again shortly." };

  const parsed = BookingSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { firstName, lastName, phone, email, guestCount, bookingDate, bookingTime, seatingPreference, specialOccasion, notes } = parsed.data;

  const restaurant = await getRestaurant();
  if (!restaurant) return { success: false, error: "Restaurant not found." };

  const bookingDateTime = new Date(`${bookingDate}T${bookingTime}:00`);
  if (isNaN(bookingDateTime.getTime())) return { success: false, error: "Invalid date or time." };
  if (bookingDateTime < new Date()) return { success: false, error: "Booking must be in the future." };

  // Upsert customer
  let customer = await prisma.customer.findFirst({
    where: { restaurantId: restaurant.id, phone },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        restaurantId: restaurant.id,
        firstName,
        lastName: lastName ?? null,
        phone,
        email: email || null,
      },
    });
  }

  // Generate unique ref
  let bookingReference = generateRef();
  let attempts = 0;
  while (attempts < 5) {
    const clash = await prisma.tableBooking.findUnique({
      where: { restaurantId_bookingReference: { restaurantId: restaurant.id, bookingReference } },
    });
    if (!clash) break;
    bookingReference = generateRef();
    attempts++;
  }

  const booking = await prisma.tableBooking.create({
    data: {
      restaurantId: restaurant.id,
      customerId: customer.id,
      bookingReference,
      guestCount,
      bookingDateTime,
      status: BookingStatus.PENDING,
      seatingPreference: seatingPreference || null,
      specialOccasion: specialOccasion || null,
      notes: notes || null,
      source: "website",
    },
  });

  await prisma.notification.create({
    data: {
      restaurantId: restaurant.id,
      type: NotificationType.BOOKING,
      title: "New booking request",
      body: `${firstName} — ${guestCount} guests on ${bookingDate} at ${bookingTime}`,
      href: "/bookings",
    },
  });

  await writeAuditLog({
    restaurantId: restaurant.id,
    action: "booking.created",
    entityType: "TableBooking",
    entityId: booking.id,
    description: `${bookingReference} — ${firstName} ${lastName ?? ""} — ${guestCount} guests`,
  });

  revalidatePath("/bookings");
  revalidatePath("/dashboard");

  return { success: true, bookingReference };
}

// ---------------------------------------------------------------------------
// Admin: confirm / cancel booking
// ---------------------------------------------------------------------------

async function requireManager() {
  if (!(await isDatabaseReachable())) return { ok: false as const, error: "Database unavailable." };
  const session = await getDemoSession();
  if (!session) return { ok: false as const, error: "Not authenticated." };
  if (!["OWNER", "MANAGER"].includes(session.role)) return { ok: false as const, error: "Insufficient permissions." };
  const restaurant = await getRestaurant();
  if (!restaurant) return { ok: false as const, error: "Restaurant not found." };
  return { ok: true as const, session, restaurantId: restaurant.id };
}

export async function confirmBooking(bookingId: string): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  const booking = await prisma.tableBooking.findFirst({
    where: { id: bookingId, restaurantId: auth.restaurantId },
  });
  if (!booking) return { success: false, error: "Booking not found." };
  if (booking.status !== BookingStatus.PENDING) return { success: false, error: "Only PENDING bookings can be confirmed." };

  await prisma.tableBooking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CONFIRMED },
  });

  await writeAuditLog({
    restaurantId: auth.restaurantId,
    userId: auth.session.userId.startsWith("fallback-") ? null : auth.session.userId,
    action: "booking.confirmed",
    entityType: "TableBooking",
    entityId: bookingId,
    description: `${booking.bookingReference} confirmed by ${auth.session.name}`,
  });

  revalidatePath("/bookings");
  return { success: true };
}

export async function cancelBooking(bookingId: string, reason?: string): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  const booking = await prisma.tableBooking.findFirst({
    where: { id: bookingId, restaurantId: auth.restaurantId },
  });
  if (!booking) return { success: false, error: "Booking not found." };
  if (booking.status === BookingStatus.CANCELLED) return { success: false, error: "Already cancelled." };

  await prisma.tableBooking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
      notes: reason ? `${booking.notes ? booking.notes + " | " : ""}Cancelled: ${reason}` : booking.notes,
    },
  });

  revalidatePath("/bookings");
  return { success: true };
}

export async function markBookingSeated(bookingId: string): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  await prisma.tableBooking.updateMany({
    where: { id: bookingId, restaurantId: auth.restaurantId, status: BookingStatus.CONFIRMED },
    data: { status: BookingStatus.SEATED },
  });

  revalidatePath("/bookings");
  return { success: true };
}
