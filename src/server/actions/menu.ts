"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isDatabaseReachable } from "@/lib/database-status";
import { getDemoSession } from "@/lib/demo/auth";
import { DEFAULT_RESTAURANT_SLUG } from "@/lib/constants";

type ActionResult = { success: true } | { success: false; error: string };

async function requireManager() {
  if (!(await isDatabaseReachable())) return { ok: false as const, error: "Database unavailable." };
  const session = await getDemoSession();
  if (!session) return { ok: false as const, error: "Not authenticated." };
  if (!["OWNER", "MANAGER"].includes(session.role)) return { ok: false as const, error: "Insufficient permissions." };
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: DEFAULT_RESTAURANT_SLUG } });
  if (!restaurant) return { ok: false as const, error: "Restaurant not found." };
  return { ok: true as const, session, restaurantId: restaurant.id };
}

function refreshMenu() {
  revalidatePath("/menu-management");
  revalidatePath("/menu");
  revalidatePath("/dashboard");
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const CategorySchema = z.object({
  name: z.string().min(1).max(60),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = CategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const slug = slugify(parsed.data.name);
  const existing = await prisma.menuCategory.findFirst({
    where: { restaurantId: auth.restaurantId, slug },
  });
  if (existing) return { success: false, error: "A category with that name already exists." };

  await prisma.menuCategory.create({
    data: {
      restaurantId: auth.restaurantId,
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? null,
      sortOrder: parsed.data.sortOrder,
    },
  });

  refreshMenu();
  return { success: true };
}

export async function updateCategory(categoryId: string, formData: FormData): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = CategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  await prisma.menuCategory.updateMany({
    where: { id: categoryId, restaurantId: auth.restaurantId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      sortOrder: parsed.data.sortOrder,
    },
  });

  refreshMenu();
  return { success: true };
}

export async function toggleCategoryActive(categoryId: string, active: boolean): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  await prisma.menuCategory.updateMany({
    where: { id: categoryId, restaurantId: auth.restaurantId },
    data: { isActive: active },
  });

  refreshMenu();
  return { success: true };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  const count = await prisma.menuItem.count({ where: { categoryId } });
  if (count > 0) return { success: false, error: `Cannot delete — ${count} item(s) still in this category.` };

  await prisma.menuCategory.deleteMany({
    where: { id: categoryId, restaurantId: auth.restaurantId },
  });

  refreshMenu();
  return { success: true };
}

// ---------------------------------------------------------------------------
// Menu items
// ---------------------------------------------------------------------------

const ItemSchema = z.object({
  name: z.string().min(1).max(120),
  categoryId: z.string().min(1),
  description: z.string().optional(),
  priceInPaise: z.coerce.number().int().min(100),
  spiceLevel: z.coerce.number().int().min(0).max(5).default(0),
  isVegetarian: z.coerce.boolean().default(false),
  isFeatured: z.coerce.boolean().default(false),
  prepTimeMinutes: z.coerce.number().int().min(1).max(120).default(15),
  imageUrl: z.string().url().optional().or(z.literal("")),
  dietaryTags: z.string().optional(),
});

export async function createMenuItem(formData: FormData): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = Object.fromEntries(formData);
  // checkboxes come as "on" or missing — normalise
  raw.isVegetarian = formData.get("isVegetarian") === "on" ? "true" : "false";
  raw.isFeatured = formData.get("isFeatured") === "on" ? "true" : "false";

  const parsed = ItemSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const slug = slugify(parsed.data.name);
  const existing = await prisma.menuItem.findFirst({
    where: { restaurantId: auth.restaurantId, slug },
  });
  if (existing) return { success: false, error: "An item with that name already exists." };

  const tags = parsed.data.dietaryTags
    ? parsed.data.dietaryTags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await prisma.menuItem.create({
    data: {
      restaurantId: auth.restaurantId,
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? null,
      priceInPaise: parsed.data.priceInPaise,
      spiceLevel: parsed.data.spiceLevel,
      isVegetarian: parsed.data.isVegetarian,
      isFeatured: parsed.data.isFeatured,
      prepTimeMinutes: parsed.data.prepTimeMinutes,
      imageUrl: parsed.data.imageUrl || null,
      dietaryTags: tags,
    },
  });

  refreshMenu();
  return { success: true };
}

export async function updateMenuItem(itemId: string, formData: FormData): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = Object.fromEntries(formData);
  raw.isVegetarian = formData.get("isVegetarian") === "on" ? "true" : "false";
  raw.isFeatured = formData.get("isFeatured") === "on" ? "true" : "false";

  const parsed = ItemSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const tags = parsed.data.dietaryTags
    ? parsed.data.dietaryTags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await prisma.menuItem.updateMany({
    where: { id: itemId, restaurantId: auth.restaurantId },
    data: {
      name: parsed.data.name,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description ?? null,
      priceInPaise: parsed.data.priceInPaise,
      spiceLevel: parsed.data.spiceLevel,
      isVegetarian: parsed.data.isVegetarian,
      isFeatured: parsed.data.isFeatured,
      prepTimeMinutes: parsed.data.prepTimeMinutes,
      imageUrl: parsed.data.imageUrl || null,
      dietaryTags: tags,
    },
  });

  refreshMenu();
  return { success: true };
}

export async function toggleItemAvailability(itemId: string, available: boolean): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  await prisma.menuItem.updateMany({
    where: { id: itemId, restaurantId: auth.restaurantId },
    data: { isAvailable: available },
  });

  refreshMenu();
  return { success: true };
}

export async function deleteMenuItem(itemId: string): Promise<ActionResult> {
  const auth = await requireManager();
  if (!auth.ok) return { success: false, error: auth.error };

  await prisma.menuItem.deleteMany({
    where: { id: itemId, restaurantId: auth.restaurantId },
  });

  refreshMenu();
  return { success: true };
}
