import { OrderStatus } from "@prisma/client";

export { OrderStatus };

/**
 * Human-readable labels for each order status.
 */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready for Pickup",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

/**
 * Allowed forward transitions for each status.
 * Any transition not listed here must be rejected by the server.
 *
 * PENDING      → CONFIRMED (owner approves) | REJECTED (owner rejects) | CANCELLED
 * CONFIRMED    → PREPARING (kitchen starts) | CANCELLED
 * PREPARING    → READY (kitchen marks ready)
 * READY        → OUT_FOR_DELIVERY (rider dispatched) | COMPLETED (pickup/dine-in)
 * OUT_FOR_DELIVERY → COMPLETED (OTP verified, delivered)
 * COMPLETED    → (terminal)
 * CANCELLED    → (terminal)
 * REJECTED     → (terminal)
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY],
  READY: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.COMPLETED],
  OUT_FOR_DELIVERY: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

/**
 * Returns true if transitioning from `from` → `to` is permitted.
 */
export function isTransitionAllowed(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Throws if the transition is not in the allowed map.
 */
export function assertTransitionAllowed(
  from: OrderStatus,
  to: OrderStatus
): void {
  if (!isTransitionAllowed(from, to)) {
    throw new Error(
      `Invalid order status transition: ${from} → ${to}`
    );
  }
}

/** Terminal statuses — no further transitions possible. */
export const TERMINAL_STATUSES: OrderStatus[] = [
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
  OrderStatus.REJECTED,
];

/** Active (non-terminal) statuses used for dashboard live-order counts. */
export const ACTIVE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.OUT_FOR_DELIVERY,
];

/** Kitchen-visible statuses. */
export const KITCHEN_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
];
