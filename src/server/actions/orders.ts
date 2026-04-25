"use server";

import { z } from "zod";
import { OrderStatus, OrderType, PaymentStatus, NotificationType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { isDatabaseReachable } from "@/lib/database-status";
import { emitRealtimeEvent } from "@/lib/realtime/bus";
import { DEFAULT_RESTAURANT_SLUG } from "@/lib/constants";
import { writeAuditLog } from "@/lib/audit";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const CreateOrderSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^[+\d\s\-()]{10,15}$/, "Enter a valid phone number"),
  orderType: z.enum(["DELIVERY", "PICKUP", "DINE_IN"]),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Cart is empty"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export type CreateOrderResult =
  | { success: true; orderNumber: string; orderId: string }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stampOrderNumber(): string {
  return `MM-${Date.now().toString().slice(-6)}`;
}

async function getRestaurant() {
  return prisma.restaurant.findUnique({
    where: { slug: DEFAULT_RESTAURANT_SLUG },
  });
}

// ---------------------------------------------------------------------------
// Main action
// ---------------------------------------------------------------------------

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  // 1. Parse + validate input
  const parsed = CreateOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const data = parsed.data;

  // 2. DB required for real order creation
  if (!(await isDatabaseReachable())) {
    return {
      success: false,
      error: "Database unavailable. Please try again in a moment.",
    };
  }

  // 3. Resolve restaurant
  const restaurant = await getRestaurant();
  if (!restaurant) {
    return { success: false, error: "Restaurant not found." };
  }

  // 4. Server-side price resolution — never trust frontend amounts
  const slugs = data.items.map((i) => i.slug);
  const dbItems = await prisma.menuItem.findMany({
    where: {
      restaurantId: restaurant.id,
      slug: { in: slugs },
      isAvailable: true,
    },
  });

  if (dbItems.length === 0) {
    return { success: false, error: "None of the selected items are available." };
  }

  // Build validated line items
  const lineItems = data.items.flatMap((cartItem) => {
    const dbItem = dbItems.find((d) => d.slug === cartItem.slug);
    if (!dbItem) return []; // item removed or unavailable — silently skip
    return [
      {
        menuItemId: dbItem.id,
        nameSnapshot: dbItem.name,
        unitPriceInPaise: dbItem.priceInPaise,
        quantity: cartItem.quantity,
        totalPriceInPaise: dbItem.priceInPaise * cartItem.quantity,
      },
    ];
  });

  if (lineItems.length === 0) {
    return { success: false, error: "Selected items are no longer available." };
  }

  // 5. Calculate totals server-side
  const subtotal = lineItems.reduce((s, i) => s + i.totalPriceInPaise, 0);
  const deliveryFee = data.orderType === "DELIVERY" ? 9900 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  // 6. Upsert customer by phone (findFirst then create — no unique constraint on phone+restaurant)
  const [firstName, ...rest] = data.customerName.trim().split(" ");
  const lastName = rest.join(" ") || null;
  const cleanPhone = data.customerPhone.trim();

  const existingCustomer = await prisma.customer.findFirst({
    where: { restaurantId: restaurant.id, phone: cleanPhone },
  });

  const customer =
    existingCustomer ??
    (await prisma.customer.create({
      data: {
        restaurantId: restaurant.id,
        firstName: firstName ?? "Guest",
        lastName,
        phone: cleanPhone,
      },
    }));

  // 7. Create order + items + payment + status log in a transaction
  const orderNumber = stampOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        restaurantId: restaurant.id,
        customerId: customer.id,
        orderNumber,
        orderType: data.orderType as OrderType,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        subtotalInPaise: subtotal,
        deliveryFeeInPaise: deliveryFee,
        taxInPaise: tax,
        totalInPaise: total,
        deliveryAddressText:
          data.orderType === "DELIVERY" ? (data.deliveryAddress ?? null) : null,
        notes: data.notes ?? null,
        placedAt: new Date(),
      },
    });

    // Order items
    await tx.orderItem.createMany({
      data: lineItems.map((li) => ({
        orderId: newOrder.id,
        menuItemId: li.menuItemId,
        nameSnapshot: li.nameSnapshot,
        unitPriceInPaise: li.unitPriceInPaise,
        quantity: li.quantity,
        totalPriceInPaise: li.totalPriceInPaise,
      })),
    });

    // Payment record
    await tx.payment.create({
      data: {
        restaurantId: restaurant.id,
        orderId: newOrder.id,
        amountInPaise: total,
        status: PaymentStatus.PENDING,
        provider: "Online",
        reference: `${orderNumber}-PAY`,
      },
    });

    // Initial status log
    await tx.orderStatusLog.create({
      data: {
        orderId: newOrder.id,
        restaurantId: restaurant.id,
        fromStatus: null,
        toStatus: OrderStatus.PENDING,
        note: "Order placed by customer",
      },
    });

    // Update customer stats
    await tx.customer.update({
      where: { id: customer.id },
      data: {
        totalOrders: { increment: 1 },
        lastOrderAt: new Date(),
      },
    });

    return newOrder;
  });

  // 8. Notification + realtime
  await prisma.notification.create({
    data: {
      restaurantId: restaurant.id,
      type: NotificationType.ORDER,
      title: "New order placed",
      body: `${order.orderNumber} — ${lineItems.length} item(s) — ₹${(total / 100).toFixed(0)}`,
      href: "/orders",
    },
  });

  revalidatePath("/orders");
  revalidatePath("/dashboard");
  revalidatePath("/kitchen");
  emitRealtimeEvent({ type: "order.created", entity: "order", entityId: order.id });

  await writeAuditLog({
    restaurantId: restaurant.id,
    action: "order.created",
    entityType: "Order",
    entityId: order.id,
    description: `Order ${order.orderNumber} placed — ${lineItems.length} item(s) — ${input.orderType}`,
    metadata: { orderNumber: order.orderNumber, totalInPaise: total, orderType: input.orderType },
  });

  console.info(`[order.created] ${order.orderNumber} restaurantId=${restaurant.id}`);

  return { success: true, orderNumber: order.orderNumber, orderId: order.id };
}

// ---------------------------------------------------------------------------
// Track order by phone + order number
// ---------------------------------------------------------------------------

export type TrackOrderResult =
  | {
      found: true;
      orderNumber: string;
      status: string;
      placedAt: Date;
      items: { name: string; quantity: number }[];
      totalInPaise: number;
      otp: string | null;
    }
  | { found: false; error: string };

export async function trackOrder(
  orderNumber: string,
  phone: string
): Promise<TrackOrderResult> {
  if (!(await isDatabaseReachable())) {
    return { found: false, error: "Database unavailable." };
  }

  const restaurant = await getRestaurant();
  if (!restaurant) return { found: false, error: "Restaurant not found." };

  const order = await prisma.order.findFirst({
    where: {
      restaurantId: restaurant.id,
      orderNumber: orderNumber.toUpperCase().trim(),
      customer: { phone: phone.trim() },
    },
    include: {
      items: { select: { nameSnapshot: true, quantity: true } },
      otpVerification: { select: { code: true, usedAt: true, expiresAt: true } },
    },
  });

  if (!order) {
    return {
      found: false,
      error: "No order found with that number and phone.",
    };
  }

  const showOtp =
    order.status === "OUT_FOR_DELIVERY" &&
    order.otpVerification &&
    !order.otpVerification.usedAt &&
    new Date() < order.otpVerification.expiresAt;

  return {
    found: true,
    orderNumber: order.orderNumber,
    status: order.status,
    placedAt: order.placedAt,
    items: order.items.map((i) => ({ name: i.nameSnapshot, quantity: i.quantity })),
    totalInPaise: order.totalInPaise,
    otp: showOtp ? order.otpVerification!.code : null,
  };
}
