# Implementation Progress

## Overall Status

* Current Phase: COMPLETE — all 10 phases done
* Last Completed Phase: 10 — Testing, cleanup, and launch checklist
* Build Status: Passing (tsc --noEmit exit 0)
* Main Blocking Issues: none

## Checklist

* [x] Phase 0 — Audit
* [x] Phase 1 — Data model and persistence foundation
* [x] Phase 2 — Order creation connected to DB
* [x] Phase 3 — Owner approval and rejection flow
* [x] Phase 4 — Kitchen workflow
* [x] Phase 5 — Delivery assignment and dispatch
* [x] Phase 6 — OTP verification and delivery completion
* [x] Phase 7 — Order list, details, history, and real-time read paths
* [x] Phase 8 — Roles, permissions, and server-side protection
* [x] Phase 9 — Logging, monitoring hooks, and operational readiness
* [x] Phase 10 — Testing, cleanup, and launch checklist

## Notes

### Stack
Next.js 16 App Router · React 19 · Prisma 6 · PostgreSQL · Zod 4 · TypeScript 5

### Auth pattern
Cookie-based demo auth. Cookie name: `mirch-masala-demo-role`.
Roles: OWNER, MANAGER, KITCHEN, DELIVERY (all active).

### Existing order statuses (Prisma enum)
PENDING → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → COMPLETED → CANCELLED

### Phase 10 additions (testing, cleanup, and launch checklist)
- `src/server/actions/order-lifecycle.ts` — removed unused `writeStatusLog` helper (dead code; all logs inlined in transactions); removed no-op `customer.update` from `verifyAndCompleteDelivery`
- Final `tsc --noEmit` — exit 0, no errors

### Launch checklist — manual golden path

**Setup**
- [ ] `docker compose up -d postgres` — DB running on :5432
- [ ] `npx prisma db push` — schema applied
- [ ] `npm run db:seed` — demo data seeded
- [ ] `npm run dev` or `npm run build && npm start` — app running on :3000
- [ ] `GET /api/health` returns `{"status":"ok"}`

**Customer flow**
- [ ] Browse `/menu`, add items to cart (bag icon count updates)
- [ ] `/cart` shows items with quantity steppers and subtotal
- [ ] `/checkout` — fill name, phone, address, submit → success screen with order number
- [ ] `/track-order` — enter order number + phone → status steps shown as PENDING

**Owner/Manager flow** (login as OWNER or MANAGER)
- [ ] `/orders` shows the new order with PENDING badge and Approve/Reject buttons
- [ ] Approve → status becomes CONFIRMED; status log timeline updates inline
- [ ] `/orders/[id]` detail page shows full timeline, items, totals
- [ ] Kitchen board at `/kitchen` — Queue column shows the CONFIRMED order
- [ ] "Start Preparing" → moves to Preparing column; "Mark Ready ✓" → Ready column

**Delivery flow** (login as OWNER or MANAGER for assign/dispatch; DELIVERY for OTP)
- [ ] `/delivery` Ready column shows the order
- [ ] Select rider from dropdown → Assign → rider name saved
- [ ] "Dispatch →" → order moves to Out for Delivery column; OTP panel appears
- [ ] `/track-order` now shows the 6-digit OTP for the customer
- [ ] Enter OTP in delivery board → "Verify ✓" → order marked COMPLETED
- [ ] `/orders/[id]` shows OTP verified timestamp and COMPLETED in timeline

**RBAC**
- [ ] Login as KITCHEN — sidebar shows only Dashboard + Kitchen; visiting /orders redirects to /kitchen
- [ ] Login as DELIVERY — sidebar shows only Dashboard + Delivery; visiting /orders redirects to /delivery

**Monitoring**
- [ ] `GET /api/health` — 200 with db: reachable
- [ ] PM2 logs show `[order.created]`, `[order.approved]` etc. on each action
- [ ] AuditLog table has entries for each significant event (check via Prisma Studio: `npx prisma studio`)

### Phase 9 additions (logging, monitoring hooks, and operational readiness)
- `src/lib/audit.ts` — `writeAuditLog()` helper: fire-and-forget write to `AuditLog` table; catches and logs its own failures so it never crashes the caller
- `src/server/actions/orders.ts` — `createOrder` writes audit log + `console.info` after success
- `src/server/actions/order-lifecycle.ts` — `approveOrder`, `rejectOrder`, `startDelivery`, `verifyAndCompleteDelivery` each write audit log + `console.info` after success
- `src/app/api/health/route.ts` — `GET /api/health` returns `{status, db, uptimeSeconds, timestamp, version}`; 200 when DB reachable, 503 when degraded
- `.env.example` — documented all required env vars with comments: `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `DEMO_RESTAURANT_SLUG`

### Phase 8 additions (roles, permissions, and server-side protection)
- `src/middleware.ts` — Next.js middleware enforces route protection at the edge: unauthenticated requests to any dashboard prefix redirect to `/login`; role without permission for a route redirects to their `ROLE_HOME`
- `src/lib/constants.ts` — `UserRole` type added; `ROLE_ALLOWED_PREFIXES` map (KITCHEN: `/dashboard`, `/kitchen`; DELIVERY: `/dashboard`, `/delivery`; OWNER/MANAGER: `/`); `ROLE_HOME` map; `dashboardNavigation` entries now include `allowedRoles: UserRole[]`
- `src/components/layout/dashboard-shell.tsx` — sidebar nav filtered by `user.role`; "Demo Control" link hidden from KITCHEN and DELIVERY roles
- Server actions: all lifecycle actions already enforce roles via `requireRole()`/`requireOwnerOrManager()` — no changes needed

### Phase 7 additions (order list, details, history, and real-time read paths)
- `src/server/queries/index.ts` — `getOrdersPageData` now includes `statusLogs` (ordered by `createdAt` asc); `getOrderDetail(id)` added — full order fetch with customer, items, payments, assignedDeliveryUser, statusLogs+actorUser, otpVerification
- `src/app/(dashboard)/orders/page.tsx` — order number links to `/orders/[id]`; inline status log timeline shown under each order card (dot-spine layout)
- `src/app/(dashboard)/orders/[id]/page.tsx` — new detail page: header with status badges + actions, customer/delivery/payment card, items+totals card (subtotal/delivery/tax/total breakdown), OTP verification status, full status history timeline with actor name+role
- Real-time: `LiveRefresh` already mounted in root layout — all pages auto-refresh on every SSE event emitted by server actions (order.approved, kitchen.progressed, delivery.dispatched, order.completed, etc.)

### Phase 6 additions (OTP verification and delivery completion)
- `src/server/actions/order-lifecycle.ts` — `generateOtp()` uses `crypto.randomInt` for a 6-digit code; `startDelivery` now upserts an `OtpVerification` record (30-min expiry) inside the dispatch transaction; `verifyAndCompleteDelivery(orderId, enteredOtp)` validates OTP (not expired, not used, attempts < max), increments attempt counter on failure, marks `usedAt` on success, transitions OUT_FOR_DELIVERY → COMPLETED with `deliveredAt`, writes `OrderStatusLog` + `Notification`
- `src/server/queries/index.ts` — `getDeliveryPageData` now includes `otpVerification { code, expiresAt, usedAt, attempts, maxAttempts }` for each order
- `src/server/actions/orders.ts` — `trackOrder` now includes `otpVerification` in the DB query; returns `otp: string | null` — only set when order is OUT_FOR_DELIVERY, OTP unused, and not expired
- `src/components/delivery/delivery-card.tsx` — OUT_FOR_DELIVERY cards show: (1) OTP code display panel (demo visibility), (2) 6-digit OTP input + Verify ✓ button wired to `verifyAndCompleteDelivery`
- `src/app/(public)/track-order/page.tsx` — replaced static scaffold with `TrackOrderForm` component
- `src/components/track-order/track-order-form.tsx` — client form: order-number + phone inputs → `trackOrder` action → progress steps (6 stages), items list, and OTP panel when OUT_FOR_DELIVERY

### Phase 5 additions (delivery assignment and dispatch)
- `src/server/actions/auth.ts` — `z.enum` updated to include `"DELIVERY"`; login page auto-shows DELIVERY user from `demoUsers`
- `src/lib/demo/demo-data.ts` — DELIVERY demo user added: Arjun Singh, `delivery@mirchmasala.demo`
- `src/server/actions/order-lifecycle.ts` — `assignDelivery(orderId, deliveryUserId)` (sets `assignedDeliveryUserId`, no status change, OWNER/MANAGER only); `startDelivery(orderId)` (READY → OUT_FOR_DELIVERY, OWNER/MANAGER/DELIVERY roles, validates rider assigned for DELIVERY orders); `refreshPaths` now includes `/delivery`
- `src/server/queries/index.ts` — `getDeliveryUsers()` returns all DELIVERY-role users; `getDeliveryPageData()` returns `{ready, inTransit, riders}`; `getOrdersPageData` now includes `assignedDeliveryUser` relation
- `src/components/delivery/delivery-card.tsx` — client card: rider select dropdown + Assign button + Dispatch button for READY; in-transit badge shows rider name for OUT_FOR_DELIVERY
- `src/app/(dashboard)/delivery/page.tsx` — 2-column dispatch board: Ready for Dispatch / Out for Delivery; uses `DeliveryCard`
- `src/lib/constants.ts` — `/delivery` added to `dashboardNavigation` (Bike icon)
- `src/components/orders/order-actions.tsx` — READY + DELIVERY orders now show assign-rider dropdown + Dispatch button; accepts `orderType`, `assignedRiderId`, `riders` props
- `src/app/(dashboard)/orders/page.tsx` — fetches `getDeliveryUsers()` in parallel; passes `riders` and `assignedRiderId` to `OrderActions`

### Phase 4 additions (kitchen workflow)
- `order-lifecycle.ts` — `startPreparing` (CONFIRMED → PREPARING), `markReady` (PREPARING → READY); both allow OWNER/MANAGER/KITCHEN roles; atomic tx with `OrderStatusLog`; `markReady` also creates a KITCHEN notification
- `src/server/queries/index.ts` — `getKitchenPageData` fixed: queue now shows `CONFIRMED` orders (not raw `PENDING`); return key renamed `pending` → `confirmed`
- `src/components/kitchen/kitchen-card.tsx` — client card with elapsed-time badge (color turns amber >10 min, red >20 min), item list with quantity bubbles, contextual action button per status
- `src/app/(dashboard)/kitchen/page.tsx` — 3-column KDS using `KitchenCard`; columns: Queue / Preparing / Ready with count badges and empty state

### Phase 3 additions (owner approval/rejection)
- `src/server/actions/order-lifecycle.ts` — `approveOrder`, `rejectOrder`, `cancelOrder`: auth check (OWNER/MANAGER), `assertTransitionAllowed` guard, atomic transaction with `OrderStatusLog` + `Notification`, realtime event
- `src/components/orders/order-actions.tsx` — client approve/reject/cancel buttons with `useTransition` pending state and inline reject-reason input
- `src/app/(dashboard)/orders/page.tsx` — expanded order cards: items list, delivery address, rejection reason, action buttons per status

### Phase 2 additions (order creation)
- `src/lib/cart.ts` — CartContext + CartItem types + useCart hook
- `src/components/cart/cart-provider.tsx` — localStorage-backed CartProvider
- `src/components/cart/add-to-cart-button.tsx` — client "Add to Cart" with quantity flash
- `src/server/actions/orders.ts` — `createOrder` (Zod validation, DB price lookup, transaction: Order + OrderItem[] + Payment + OrderStatusLog), `trackOrder`
- `src/components/checkout/checkout-form.tsx` — real checkout form (order type, name, phone, address)
- `src/app/(public)/cart/page.tsx` — real cart UI with quantity stepper + remove
- `src/app/(public)/checkout/page.tsx` — wired to CheckoutForm
- `src/app/(public)/menu/[id]/page.tsx` — AddToCartButton wired
- `src/app/(public)/layout.tsx` — wrapped with CartProvider
- `src/components/ui/category-tabs.tsx` — "Order" links to `/menu/[slug]`

### Phase 1 additions (schema)
- `UserRole.DELIVERY` — new enum value for rider accounts
- `OrderStatus.REJECTED` — new terminal status for owner rejection
- `Order.rejectionReason String?` — owner's rejection note
- `Order.approvedAt DateTime?` — timestamp of approval
- `Order.assignedDeliveryUserId String?` — FK → User (rider)
- `Order.statusLogs OrderStatusLog[]` — history relation
- `Order.otpVerification OtpVerification?` — one-to-one OTP
- `OrderStatusLog` model — full transition audit trail per order
- `OtpVerification` model — OTP code + expiry + attempt tracking
- `src/lib/order-status.ts` — status constants, labels, allowed-transition map, guard helpers

### Key gaps discovered in audit

| Gap | Detail |
|---|---|
| Cart/checkout are UI shells | No server action for real order creation |
| No order_status_logs table | No audit trail for status changes |
| No OTP model | No OTP generation, storage, or verification |
| No DELIVERY user role | Must be added to UserRole enum |
| No assigned rider field on Order | Delivery assignment has no DB backing |
| No status transition validation | Any → any status is currently allowed |
| No backend price validation | Prices not re-verified on order creation |
| No status constants module | OrderStatus strings are hardcoded throughout |
| No rider-facing screens | No delivery dashboard or workflow UI |

### Critical files (reference)
- `prisma/schema.prisma` — single source of truth for DB
- `src/server/actions/demo.ts` — existing order lifecycle server actions
- `src/server/queries/index.ts` — all server-side data reads
- `src/lib/demo/chat-actions.ts` — order creation from chat (reference impl)
- `src/lib/demo/demo-data.ts` — all mock data (to be deprecated incrementally)
- `src/app/(dashboard)/kitchen/page.tsx` — KDS (needs action buttons wired)
- `src/app/(public)/cart/page.tsx` — UI shell (needs real backend)
- `src/app/(public)/checkout/page.tsx` — UI shell (needs real backend)

### Phase 0 audit findings summary
- 20 Prisma models already exist covering orders, payments, bookings, events,
  conversations, notifications, inventory, delivery zones, and audit logs
- 2 API routes exist: `/api/events` (SSE) and `/api/admin/upload-image`
- All business mutations use Next.js server actions (no REST CRUD yet)
- Dashboard screens (orders, kitchen, bookings, events, analytics) read from DB
- Customer-facing cart and checkout are pure UI shells
- Order creation currently only possible via demo control panel or chat engine
- WhatsApp flow is a full state machine but is simulation-only
- No OTP or delivery rider model/flow exists anywhere in the codebase
