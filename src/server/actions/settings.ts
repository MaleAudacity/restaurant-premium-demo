"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RESTAURANT_SLUG } from "@/lib/constants";
import { cookies } from "next/headers";

type ActionResult = { success: true } | { success: false; error: string };

async function requireManager(): Promise<{ ok: true; restaurantId: string } | { ok: false; error: string }> {
  const cookieStore = await cookies();
  const role = cookieStore.get("mirch-masala-demo-role")?.value;
  if (!role || !["OWNER", "MANAGER"].includes(role)) {
    return { ok: false, error: "Unauthorized." };
  }
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: DEFAULT_RESTAURANT_SLUG } });
  if (!restaurant) return { ok: false, error: "Restaurant not found." };
  return { ok: true, restaurantId: restaurant.id };
}

// ---------------------------------------------------------------------------
// Restaurant info
// ---------------------------------------------------------------------------

const RestaurantInfoSchema = z.object({
  name: z.string().min(2),
  tagline: z.string().optional(),
  phone: z.string().min(7),
  email: z.string().email(),
  addressLine1: z.string().min(3),
  city: z.string().min(2),
});

export async function updateRestaurantInfo(formData: FormData): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = RestaurantInfoSchema.safeParse({
    name: formData.get("name"),
    tagline: formData.get("tagline") || undefined,
    phone: formData.get("phone"),
    email: formData.get("email"),
    addressLine1: formData.get("addressLine1"),
    city: formData.get("city"),
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  await prisma.restaurant.update({
    where: { id: auth.restaurantId },
    data: parsed.data,
  });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Business hours
// ---------------------------------------------------------------------------

export async function updateBusinessHour(
  dayOfWeek: number,
  opensAt: string,
  closesAt: string,
  isClosed: boolean,
): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  await prisma.businessHour.updateMany({
    where: { restaurantId: auth.restaurantId, dayOfWeek },
    data: { opensAt, closesAt, isClosed },
  });
  revalidatePath("/settings");
  revalidatePath("/book-table");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Delivery zones
// ---------------------------------------------------------------------------

const ZoneSchema = z.object({
  name: z.string().min(2),
  minOrderInPaise: z.number().int().min(0),
  deliveryFeeInPaise: z.number().int().min(0),
  estimatedMinutes: z.number().int().min(1),
});

export async function createDeliveryZone(formData: FormData): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = ZoneSchema.safeParse({
    name: formData.get("name"),
    minOrderInPaise: Math.round(parseFloat(String(formData.get("minOrder") ?? "0")) * 100),
    deliveryFeeInPaise: Math.round(parseFloat(String(formData.get("deliveryFee") ?? "0")) * 100),
    estimatedMinutes: parseInt(String(formData.get("estimatedMinutes") ?? "30")),
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  await prisma.deliveryZone.create({
    data: { restaurantId: auth.restaurantId, ...parsed.data },
  });
  revalidatePath("/settings");
  return { success: true };
}

export async function deleteDeliveryZone(zoneId: string): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  await prisma.deliveryZone.delete({ where: { id: zoneId, restaurantId: auth.restaurantId } });
  revalidatePath("/settings");
  return { success: true };
}

export async function toggleDeliveryZone(zoneId: string, isActive: boolean): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  await prisma.deliveryZone.update({ where: { id: zoneId }, data: { isActive } });
  revalidatePath("/settings");
  return { success: true };
}
