"use server";

import { OrderStatus, NotificationType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { isDatabaseReachable } from "@/lib/database-status";
import { getDemoSession } from "@/lib/demo/auth";
import { assertTransitionAllowed } from "@/lib/order-status";
import { emitRealtimeEvent } from "@/lib/realtime/bus";
import { writeAuditLog } from "@/lib/audit";
import { sendPushToAll } from "@/server/actions/push";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

type ActionResult = { success: true } | { success: false; error: string };

type AuthOk = { ok: true; session: NonNullable<Awaited<ReturnType<typeof getDemoSession>>> };
type AuthFail = { ok: false; error: string };

async function requireRole(roles: string[]): Promise<AuthOk | AuthFail> {
  if (!(await isDatabaseReachable())) {
    return { ok: false, error: "Database unavailable." };
  }
  const session = await getDemoSession();
  if (!session) return { ok: false, error: "Not authenticated." };
  if (!roles.includes(session.role)) {
    return { ok: false, error: `Role "${session.role}" cannot perform this action.` };
  }
  return { ok: true, session };
}

async function requireOwnerOrManager(): Promise<AuthOk | AuthFail> {
  return requireRole(["OWNER", "MANAGER"]);
}

async function getOrderOrFail(orderId: string, restaurantId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, restaurantId },
  });
  if (!order) return null;
  return order;
}

function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

function refreshPaths() {
  revalidatePath("/orders");
  revalidatePath("/dashboard");
  revalidatePath("/kitchen");
  revalidatePath("/delivery");
}

// ---------------------------------------------------------------------------
// Approve order  (PENDING → CONFIRMED)
// ---------------------------------------------------------------------------

export async function approveOrder(orderId: string): Promise<ActionResult> {
  const auth = await requireOwnerOrManager();
  if (!auth.ok) return { success: false, error: auth.error };

  const { session } = auth;

  const order = await getOrderOrFail(orderId, session.restaurantId);
  if (!order) return { success: false, error: "Order not found." };

  try {
    assertTransitionAllowed(order.status, OrderStatus.CONFIRMED);
  } catch {
    return {
      success: false,
      error: `Cannot approve an order with status "${order.status}".`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CONFIRMED,
        approvedAt: new Date(),
      },
    });

    await tx.orderStatusLog.create({
      data: {
        orderId,
        restaurantId: session.restaurantId,
        actorUserId: session.userId.startsWith("fallback-") ? null : session.userId,
        fromStatus: order.status,
        toStatus: OrderStatus.CONFIRMED,
        note: `Approved by ${session.name}`,
      },
    });

    await tx.notification.create({
      data: {
        restaurantId: session.restaurantId,
        type: NotificationType.ORDER,
        title: "Order approved",
        body: `${order.orderNumber} approved by ${session.name}`,
        href: "/kitchen",
      },
    });
  });

  refreshPaths();
  emitRealtimeEvent({ type: "order.approved", entity: "order", entityId: orderId });
  sendPushToAll(session.restaurantId, { title: "New Order Confirmed", body: `Order ${order.orderNumber} is being prepared`, url: "/kitchen" }).catch(() => {});
  console.info(`[order.approved] ${order.orderNumber} by ${session.name}`);
  await writeAuditLog({
    restaurantId: session.restaurantId,
    userId: session.userId.startsWith("fallback-") ? null : session.userId,
    action: "order.approved",
    entityType: "Order",
    entityId: orderId,
    description: `${order.orderNumber} approved by ${session.name}`,
  });
  return { success: true };
}

// ---------------------------------------------------------------------------
// Reject order  (PENDING → REJECTED)
// ---------------------------------------------------------------------------

export async function rejectOrder(
  orderId: string,
  reason?: string
): Promise<ActionResult> {
  const auth = await requireOwnerOrManager();
  if (!auth.ok) return { success: false, error: auth.error };

  const { session } = auth;

  const order = await getOrderOrFail(orderId, session.restaurantId);
  if (!order) return { success: false, error: "Order not found." };

  try {
    assertTransitionAllowed(order.status, OrderStatus.REJECTED);
  } catch {
    return {
      success: false,
      error: `Cannot reject an order with status "${order.status}".`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.REJECTED,
        rejectionReason: reason?.trim() || null,
      },
    });

    await tx.orderStatusLog.create({
      data: {
        orderId,
        restaurantId: session.restaurantId,
        actorUserId: session.userId.startsWith("fallback-") ? null : session.userId,
        fromStatus: order.status,
        toStatus: OrderStatus.REJECTED,
        note: reason?.trim()
          ? `Rejected by ${session.name}: ${reason.trim()}`
          : `Rejected by ${session.name}`,
      },
    });
  });

  refreshPaths();
  emitRealtimeEvent({ type: "order.rejected", entity: "order", entityId: orderId });
  console.info(`[order.rejected] ${order.orderNumber} by ${session.name}`);
  await writeAuditLog({
    restaurantId: session.restaurantId,
    userId: session.userId.startsWith("fallback-") ? null : session.userId,
    action: "order.rejected",
    entityType: "Order",
    entityId: orderId,
    description: `${order.orderNumber} rejected by ${session.name}${reason ? `: ${reason.trim()}` : ""}`,
    metadata: reason ? { reason: reason.trim() } : undefined,
  });
  return { success: true };
}

// ---------------------------------------------------------------------------
// Cancel order  (PENDING | CONFIRMED → CANCELLED)
// ---------------------------------------------------------------------------

export async function cancelOrder(
  orderId: string,
  reason?: string
): Promise<ActionResult> {
  const auth = await requireOwnerOrManager();
  if (!auth.ok) return { success: false, error: auth.error };

  const { session } = auth;

  const order = await getOrderOrFail(orderId, session.restaurantId);
  if (!order) return { success: false, error: "Order not found." };

  try {
    assertTransitionAllowed(order.status, OrderStatus.CANCELLED);
  } catch {
    return {
      success: false,
      error: `Cannot cancel an order with status "${order.status}".`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED, rejectionReason: reason?.trim() || null },
    });

    await tx.orderStatusLog.create({
      data: {
        orderId,
        restaurantId: session.restaurantId,
        actorUserId: session.userId.startsWith("fallback-") ? null : session.userId,
        fromStatus: order.status,
        toStatus: OrderStatus.CANCELLED,
        note: reason?.trim()
          ? `Cancelled by ${session.name}: ${reason.trim()}`
          : `Cancelled by ${session.name}`,
      },
    });
  });

  refreshPaths();
  emitRealtimeEvent({ type: "order.cancelled", entity: "order", entityId: orderId });
  return { success: true };
}

// ---------------------------------------------------------------------------
// Start preparing  (CONFIRMED → PREPARING)
// ---------------------------------------------------------------------------

export async function startPreparing(orderId: string): Promise<ActionResult> {
  const auth = await requireRole(["OWNER", "MANAGER", "KITCHEN"]);
  if (!auth.ok) return { success: false, error: auth.error };
  const { session } = auth;

  const order = await getOrderOrFail(orderId, session.restaurantId);
  if (!order) return { success: false, error: "Order not found." };

  try {
    assertTransitionAllowed(order.status, OrderStatus.PREPARING);
  } catch {
    return { success: false, error: `Cannot start preparing an order with status "${order.status}".` };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PREPARING },
    });
    await tx.orderStatusLog.create({
      data: {
        orderId,
        restaurantId: session.restaurantId,
        actorUserId: session.userId.startsWith("fallback-") ? null : session.userId,
        fromStatus: order.status,
        toStatus: OrderStatus.PREPARING,
        note: `Preparation started by ${session.name}`,
      },
    });
  });

  refreshPaths();
  emitRealtimeEvent({ type: "kitchen.progressed", entity: "order", entityId: orderId });
  return { success: true };
}

// ---------------------------------------------------------------------------
// Mark ready  (PREPARING → READY)
// ---------------------------------------------------------------------------

export async function markReady(orderId: string): Promise<ActionResult> {
  const auth = await requireRole(["OWNER", "MANAGER", "KITCHEN"]);
  if (!auth.ok) return { success: false, error: auth.error };
  const { session } = auth;

  const order = await getOrderOrFail(orderId, session.restaurantId);
  if (!order) return { success: false, error: "Order not found." };

  try {
    assertTransitionAllowed(order.status, OrderStatus.READY);
  } catch {
    return { success: false, error: `Cannot mark ready an order with status "${order.status}".` };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.READY, readyAt: new Date() },
    });
    await tx.orderStatusLog.create({
      data: {
        orderId,
        restaurantId: session.restaurantId,
        actorUserId: session.userId.startsWith("fallback-") ? null : session.userId,
        fromStatus: order.status,
        toStatus: OrderStatus.READY,
        note: `Marked ready by ${session.name}`,
      },
    });
    await tx.notification.create({
      data: {
        restaurantId: session.restaurantId,
        type: NotificationType.KITCHEN,
        title: "Order ready",
        body: `${order.orderNumber} is ready for pickup / dispatch`,
        href: "/orders",
      },
    });
  });

  refreshPaths();
  emitRealtimeEvent({ type: "kitchen.progressed", entity: "order", entityId: orderId });
  sendPushToAll(session.restaurantId, { title: "Order Ready", body: `Order ${order.orderNumber} is ready for pickup/delivery`, url: "/delivery" }).catch(() => {});
  return { success: true };
}

// ---------------------------------------------------------------------------
// Assign delivery rider  (READY — sets rider, no status change)
// ---------------------------------------------------------------------------

export async function assignDelivery(
  orderId: string,
  deliveryUserId: string,
): Promise<ActionResult> {
  const auth = await requireOwnerOrManager();
  if (!auth.ok) return { success: false, error: auth.error };
  const { session } = auth;

  const order = await getOrderOrFail(orderId, session.restaurantId);
  if (!order) return { success: false, error: "Order not found." };
  if (order.status !== OrderStatus.READY && order.status !== OrderStatus.OUT_FOR_DELIVERY) {
    return { success: false, error: "Rider can only be assigned to READY or OUT_FOR_DELIVERY orders." };
  }

  const rider = await prisma.user.findFirst({
    where: { id: deliveryUserId, restaurantId: session.restaurantId, role: "DELIVERY" },
  });
  if (!rider) return { success: false, error: "Delivery rider not found." };

  await prisma.order.update({
    where: { id: orderId },
    data: { assignedDeliveryUserId: deliveryUserId },
  });

  refreshPaths();
  emitRealtimeEvent({ type: "delivery.assigned", entity: "order", entityId: orderId });
  return { success: true };
}

// ---------------------------------------------------------------------------
// Start delivery  (READY → OUT_FOR_DELIVERY)
// ---------------------------------------------------------------------------

export async function startDelivery(orderId: string): Promise<ActionResult> {
  const auth = await requireRole(["OWNER", "MANAGER", "DELIVERY"]);
  if (!auth.ok) return { success: false, error: auth.error };
  const { session } = auth;

  const order = await getOrderOrFail(orderId, session.restaurantId);
  if (!order) return { success: false, error: "Order not found." };

  try {
    assertTransitionAllowed(order.status, OrderStatus.OUT_FOR_DELIVERY);
  } catch {
    return { success: false, error: `Cannot dispatch an order with status "${order.status}".` };
  }

  if (order.orderType === "DELIVERY" && !order.assignedDeliveryUserId) {
    return { success: false, error: "Assign a delivery rider before dispatching." };
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.OUT_FOR_DELIVERY },
    });
    await tx.orderStatusLog.create({
      data: {
        orderId,
        restaurantId: session.restaurantId,
        actorUserId: session.userId.startsWith("fallback-") ? null : session.userId,
        fromStatus: order.status,
        toStatus: OrderStatus.OUT_FOR_DELIVERY,
        note: `Dispatched by ${session.name}`,
      },
    });
    // Upsert OTP — replace if rider was re-dispatched
    await tx.otpVerification.upsert({
      where: { orderId },
      create: { orderId, code: otp, expiresAt: otpExpiresAt },
      update: { code: otp, expiresAt: otpExpiresAt, usedAt: null, attempts: 0 },
    });
    await tx.notification.create({
      data: {
        restaurantId: session.restaurantId,
        type: NotificationType.ORDER,
        title: "Order dispatched",
        body: `${order.orderNumber} is out for delivery`,
        href: "/delivery",
      },
    });
  });

  refreshPaths();
  emitRealtimeEvent({ type: "delivery.dispatched", entity: "order", entityId: orderId });
  console.info(`[delivery.dispatched] ${order.orderNumber} by ${session.name}`);
  await writeAuditLog({
    restaurantId: session.restaurantId,
    userId: session.userId.startsWith("fallback-") ? null : session.userId,
    action: "delivery.dispatched",
    entityType: "Order",
    entityId: orderId,
    description: `${order.orderNumber} dispatched by ${session.name}`,
    metadata: { assignedDeliveryUserId: order.assignedDeliveryUserId ?? null },
  });
  return { success: true };
}

// ---------------------------------------------------------------------------
// Verify OTP and complete delivery  (OUT_FOR_DELIVERY → COMPLETED)
// ---------------------------------------------------------------------------

export async function verifyAndCompleteDelivery(
  orderId: string,
  enteredOtp: string,
): Promise<ActionResult> {
  const auth = await requireRole(["OWNER", "MANAGER", "DELIVERY"]);
  if (!auth.ok) return { success: false, error: auth.error };
  const { session } = auth;

  const order = await getOrderOrFail(orderId, session.restaurantId);
  if (!order) return { success: false, error: "Order not found." };

  if (order.status !== OrderStatus.OUT_FOR_DELIVERY) {
    return { success: false, error: `Order is not out for delivery (status: ${order.status}).` };
  }

  const otpRecord = await prisma.otpVerification.findUnique({ where: { orderId } });
  if (!otpRecord) return { success: false, error: "No OTP found for this order." };
  if (otpRecord.usedAt) return { success: false, error: "OTP already used." };
  if (new Date() > otpRecord.expiresAt) return { success: false, error: "OTP has expired." };
  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    return { success: false, error: "Too many failed attempts. Contact support." };
  }

  if (enteredOtp.trim() !== otpRecord.code) {
    await prisma.otpVerification.update({
      where: { orderId },
      data: { attempts: { increment: 1 } },
    });
    const remaining = otpRecord.maxAttempts - otpRecord.attempts - 1;
    return { success: false, error: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.COMPLETED, deliveredAt: new Date() },
    });
    await tx.otpVerification.update({
      where: { orderId },
      data: { usedAt: new Date(), attempts: { increment: 1 } },
    });
    await tx.orderStatusLog.create({
      data: {
        orderId,
        restaurantId: session.restaurantId,
        actorUserId: session.userId.startsWith("fallback-") ? null : session.userId,
        fromStatus: OrderStatus.OUT_FOR_DELIVERY,
        toStatus: OrderStatus.COMPLETED,
        note: `Delivery confirmed by ${session.name} via OTP`,
      },
    });
    await tx.notification.create({
      data: {
        restaurantId: session.restaurantId,
        type: NotificationType.ORDER,
        title: "Order delivered",
        body: `${order.orderNumber} delivered and OTP verified`,
        href: "/orders",
      },
    });
  });

  refreshPaths();
  emitRealtimeEvent({ type: "order.completed", entity: "order", entityId: orderId });
  console.info(`[order.completed] ${order.orderNumber} verified by ${session.name}`);
  await writeAuditLog({
    restaurantId: session.restaurantId,
    userId: session.userId.startsWith("fallback-") ? null : session.userId,
    action: "order.completed",
    entityType: "Order",
    entityId: orderId,
    description: `${order.orderNumber} delivered and OTP verified by ${session.name}`,
  });
  return { success: true };
}
