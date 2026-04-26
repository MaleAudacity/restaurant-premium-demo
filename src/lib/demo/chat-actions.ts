import {
  BookingStatus,
  EventInquiryStatus,
  OrderStatus,
  OrderType,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  buildPostIntentMessages,
  getIntentPayload,
  resolveChatTransition,
} from "@/lib/demo/chat-engine";
import {
  appendConversationMessages,
  ensureDemoChatConversation,
  getDemoChatRuntime,
  readConversationState,
  resetDemoChatConversation,
  startFreshDemoChatConversation,
  updateConversationState,
} from "@/lib/demo/chat-state";
import { emitConversationMessageAppended } from "@/lib/realtime/conversation-events";
import {
  type ChatDraftMessage,
  type ChatEffectResult,
  type ChatInput,
  type ChatRecordIntent,
  type StoredConversationState,
} from "@/lib/demo/chat-types";

type DbClient = Prisma.TransactionClient | typeof prisma;

function stampReference(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function stampOrderNumber() {
  return `MM-${Date.now().toString().slice(-6)}`;
}

function systemMessage(content: string): ChatDraftMessage {
  return {
    direction: "SYSTEM",
    messageType: "SYSTEM",
    content,
  };
}

function statusCard(args: {
  title: string;
  subtitle?: string;
  badge?: string;
  tone?: "amber" | "emerald" | "stone";
  rows: Array<{ label: string; value: string }>;
  footnote?: string;
}): ChatDraftMessage {
  return {
    direction: "OUTBOUND",
    messageType: "CARD",
    content: args.title,
    metadata: {
      card: {
        kind: "status",
        tone: args.tone ?? "stone",
        title: args.title,
        subtitle: args.subtitle,
        badge: args.badge,
        rows: args.rows,
        footnote: args.footnote,
      },
    },
  };
}

async function appendConversationUpdate(
  db: DbClient,
  args: {
    restaurantId: string;
    conversationId: string;
    summary?: string;
    messages?: ChatDraftMessage[];
  },
) {
  if (args.messages?.length) {
    await appendConversationMessages(db, {
      restaurantId: args.restaurantId,
      conversationId: args.conversationId,
      messages: args.messages,
    });
  }

  if (args.summary) {
    await db.conversation.update({
      where: {
        id: args.conversationId,
      },
      data: {
        summary: args.summary,
        lastMessageAt: new Date(),
      },
    });
  }
}

async function getPrimaryConversation(db: DbClient) {
  return ensureDemoChatConversation(db);
}

async function getTargetOrder(db: DbClient, orderId?: string) {
  const runtime = await getDemoChatRuntime(db);

  if (orderId) {
    return db.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        customer: true,
        payments: true,
      },
    });
  }

  return db.order.findFirst({
    where: {
      restaurantId: runtime.restaurant.id,
    },
    include: {
      customer: true,
      payments: true,
    },
    orderBy: {
      placedAt: "desc",
    },
  });
}

async function getTargetBooking(db: DbClient, bookingId?: string) {
  const runtime = await getDemoChatRuntime(db);

  if (bookingId) {
    return db.tableBooking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        customer: true,
      },
    });
  }

  return db.tableBooking.findFirst({
    where: {
      restaurantId: runtime.restaurant.id,
    },
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getTargetEvent(db: DbClient, inquiryId?: string) {
  const runtime = await getDemoChatRuntime(db);

  if (inquiryId) {
    return db.eventInquiry.findUnique({
      where: {
        id: inquiryId,
      },
      include: {
        customer: true,
      },
    });
  }

  return db.eventInquiry.findFirst({
    where: {
      restaurantId: runtime.restaurant.id,
    },
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function ensureOrderConversation(
  db: DbClient,
  order: { id: string; conversationId: string | null; restaurantId: string },
) {
  if (order.conversationId) {
    return db.conversation.findUniqueOrThrow({
      where: {
        id: order.conversationId,
      },
    });
  }

  const conversation = await getPrimaryConversation(db);
  await db.order.update({
    where: {
      id: order.id,
    },
    data: {
      conversationId: conversation.id,
    },
  });

  return conversation;
}

async function ensureBookingConversation(
  db: DbClient,
  booking: { id: string; restaurantId: string },
) {
  const linkedConversation = await db.conversation.findFirst({
    where: {
      bookingId: booking.id,
    },
  });

  if (linkedConversation) {
    return linkedConversation;
  }

  const conversation = await getPrimaryConversation(db);
  await db.conversation.update({
    where: {
      id: conversation.id,
    },
    data: {
      bookingId: booking.id,
    },
  });

  return conversation;
}

async function ensureEventConversation(
  db: DbClient,
  event: { id: string; restaurantId: string },
) {
  const linkedConversation = await db.conversation.findFirst({
    where: {
      eventInquiryId: event.id,
    },
  });

  if (linkedConversation) {
    return linkedConversation;
  }

  const conversation = await getPrimaryConversation(db);
  await db.conversation.update({
    where: {
      id: conversation.id,
    },
    data: {
      eventInquiryId: event.id,
    },
  });

  return conversation;
}

async function upsertPaymentRecord(
  db: DbClient,
  args: {
    orderId: string;
    restaurantId: string;
    amountInPaise: number;
    status: PaymentStatus;
    reference: string;
    failureReason?: string | null;
  },
) {
  const existingPayment = await db.payment.findFirst({
    where: {
      orderId: args.orderId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existingPayment) {
    return db.payment.update({
      where: {
        id: existingPayment.id,
      },
      data: {
        status: args.status,
        reference: args.reference,
        provider: existingPayment.provider ?? "Mirch Masala Demo UPI",
        failureReason: args.failureReason ?? null,
        paidAt: args.status === PaymentStatus.SUCCESS ? new Date() : null,
      },
    });
  }

  return db.payment.create({
    data: {
      restaurantId: args.restaurantId,
      orderId: args.orderId,
      amountInPaise: args.amountInPaise,
      status: args.status,
      provider: "Mirch Masala Demo UPI",
      reference: args.reference,
      failureReason: args.failureReason ?? null,
      paidAt: args.status === PaymentStatus.SUCCESS ? new Date() : null,
    },
  });
}

async function createEffectForIntent(args: {
  db: DbClient;
  runtime: Awaited<ReturnType<typeof getDemoChatRuntime>>;
  intent: ChatRecordIntent;
  conversationId: string;
  restaurantId: string;
  customerId: string | null;
  state: StoredConversationState;
}) {
  if (!args.customerId) {
    throw new Error("Missing customer context for chat flow record creation.");
  }

  if (args.intent.type === "CREATE_ORDER_PENDING") {
    const payload = getIntentPayload(args.intent, args.runtime, args.state.context);
    if (!payload || !("totals" in payload) || !("cart" in payload) || !payload.totals || !Array.isArray(payload.cart)) {
      throw new Error("Order payload was not available for guided checkout.");
    }

    const orderNumber = stampOrderNumber();
    const totals = payload.totals;
    const cart = payload.cart;

    const order = await args.db.order.create({
      data: {
        restaurantId: args.restaurantId,
        customerId: args.customerId,
        conversationId: args.conversationId,
        orderNumber,
        orderType: payload.orderType as OrderType,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: "Demo UPI",
        subtotalInPaise: totals.subtotalInPaise,
        deliveryFeeInPaise: totals.deliveryFeeInPaise,
        taxInPaise: totals.taxInPaise,
        totalInPaise: totals.totalInPaise,
        notes:
          payload.orderType === "DELIVERY"
            ? "Created from guided WhatsApp simulator delivery flow."
            : "Created from guided WhatsApp simulator order flow.",
        deliveryAddressText: payload.orderType === "DELIVERY" ? payload.addressOrNote : null,
        metadata: {
          source: "demo-chat",
          note: payload.addressOrNote,
        },
      },
    });

    for (const item of cart) {
      await args.db.orderItem.create({
        data: {
          orderId: order.id,
          menuItemId: item.itemId,
          nameSnapshot: item.itemName,
          unitPriceInPaise: item.unitPriceInPaise,
          quantity: item.quantity,
          totalPriceInPaise: item.unitPriceInPaise * item.quantity,
          notes: item.categoryName,
        },
      });
    }

    await upsertPaymentRecord(args.db, {
      restaurantId: args.restaurantId,
      orderId: order.id,
      amountInPaise: totals.totalInPaise,
      status: PaymentStatus.PENDING,
      reference: `${orderNumber}-PAY`,
    });

    return {
      id: order.id,
      reference: orderNumber,
      totalInPaise: totals.totalInPaise,
      statusLabel: "Awaiting payment",
    } satisfies ChatEffectResult;
  }

  if (args.intent.type === "CREATE_TABLE_BOOKING") {
    const payload = getIntentPayload(args.intent, args.runtime, args.state.context);
    if (!payload || !("bookingDateTime" in payload) || !("guestCount" in payload)) {
      throw new Error("Booking payload was not available for the table request.");
    }

    const bookingReference = stampReference("BK");
    const guestCount = payload.guestCount;
    const bookingDateTime = payload.bookingDateTime;
    if (!guestCount || !bookingDateTime) {
      throw new Error("Booking details were incomplete.");
    }

    const booking = await args.db.tableBooking.create({
      data: {
        restaurantId: args.restaurantId,
        customerId: args.customerId,
        bookingReference,
        guestCount,
        bookingDateTime,
        status: BookingStatus.PENDING,
        seatingPreference: args.state.context.tableBooking.seatingPreference,
        specialOccasion: "WhatsApp simulator booking",
        source: "demo-chat",
        notes: args.state.context.tableBooking.specialRequest,
      },
    });

    await args.db.conversation.update({
      where: {
        id: args.conversationId,
      },
      data: {
        bookingId: booking.id,
      },
    });

    return {
      id: booking.id,
      reference: bookingReference,
      statusLabel: "Pending approval",
    } satisfies ChatEffectResult;
  }

  const inquiryReference = stampReference("EV");
  const payload = getIntentPayload(args.intent, args.runtime, args.state.context);
  if (!payload || !("eventDate" in payload) || !("guestCount" in payload)) {
    throw new Error("Event inquiry payload was not available for submission.");
  }
  const guestCount = payload.guestCount;
  const eventDate = payload.eventDate;
  if (!guestCount || !eventDate) {
    throw new Error("Event inquiry details were incomplete.");
  }

  const event = await args.db.eventInquiry.create({
    data: {
      restaurantId: args.restaurantId,
      customerId: args.customerId,
      inquiryReference,
      eventType:
        args.intent.type === "CREATE_PARTY_INQUIRY"
          ? "Birthday / Party Booking"
          : args.state.context.weddingEvent.eventType ?? "Event Inquiry",
      guestCount,
      eventDate,
      budgetRange:
        args.intent.type === "CREATE_PARTY_INQUIRY"
          ? args.state.context.birthdayParty.budgetRange
          : args.state.context.weddingEvent.budgetRange,
      status: EventInquiryStatus.NEW,
      venuePreference:
        args.intent.type === "CREATE_PARTY_INQUIRY"
          ? args.state.context.birthdayParty.decorationRequired
            ? "Decoration requested"
            : "Food-focused celebration"
          : "Premium event planning",
      source: "demo-chat",
      notes:
        args.intent.type === "CREATE_PARTY_INQUIRY"
          ? `Food preference: ${args.state.context.birthdayParty.foodPreference ?? "Not specified"}`
          : args.state.context.weddingEvent.notes,
    },
  });

  await args.db.conversation.update({
    where: {
      id: args.conversationId,
    },
    data: {
      eventInquiryId: event.id,
    },
  });

  return {
    id: event.id,
    reference: inquiryReference,
    statusLabel:
      args.intent.type === "CREATE_PARTY_INQUIRY" ? "Callback queued" : "Inquiry submitted",
  } satisfies ChatEffectResult;
}

function applyEffectToState(
  state: StoredConversationState,
  intent: ChatRecordIntent,
  effect: ChatEffectResult,
) {
  const nextState: StoredConversationState = {
    currentFlow: state.currentFlow,
    currentStep: state.currentStep,
    context: structuredClone(state.context),
  };

  if (intent.type === "CREATE_ORDER_PENDING") {
    nextState.context.order.recordId = effect.id;
    nextState.context.order.orderNumber = effect.reference;
    nextState.context.order.paymentStatusLabel = effect.statusLabel;
  } else if (intent.type === "CREATE_TABLE_BOOKING") {
    nextState.context.tableBooking.recordId = effect.id;
    nextState.context.tableBooking.bookingReference = effect.reference;
  } else if (intent.type === "CREATE_PARTY_INQUIRY") {
    nextState.context.birthdayParty.recordId = effect.id;
    nextState.context.birthdayParty.inquiryReference = effect.reference;
  } else if (intent.type === "CREATE_WEDDING_INQUIRY") {
    nextState.context.weddingEvent.recordId = effect.id;
    nextState.context.weddingEvent.inquiryReference = effect.reference;
  }

  return nextState;
}

export async function progressDemoChat(input: {
  conversationId?: string;
  value: string;
  quickReplyKey?: string | null;
}) {
  const normalizedInput: ChatInput = {
    value: input.value.trim(),
    quickReplyKey: input.quickReplyKey ?? null,
  };

  if (!normalizedInput.value) {
    return;
  }

  // last-write-wins on simultaneous tabs; demo scope.
  const { conversationId } = await prisma.$transaction(async (tx) => {
    const runtime = await getDemoChatRuntime(tx);
    const primaryConversation = await ensureDemoChatConversation(tx);
    const conversationId = input.conversationId ?? primaryConversation.id;
    const conversation =
      conversationId === primaryConversation.id
        ? primaryConversation
        : await tx.conversation.findUniqueOrThrow({
            where: {
              id: conversationId,
            },
            include: {
              customer: {
                include: {
                  addresses: true,
                },
              },
              messages: {
                orderBy: {
                  createdAt: "asc",
                },
              },
            },
          });

    await appendConversationMessages(tx, {
      restaurantId: conversation.restaurantId,
      conversationId: conversation.id,
      messages: [
        {
          direction: "INBOUND",
          messageType: "TEXT",
          content: normalizedInput.value,
          quickReplyKey: normalizedInput.quickReplyKey,
        },
      ],
    });

    const currentState = readConversationState(conversation);
    const transition = resolveChatTransition(currentState, normalizedInput, runtime);

    let nextState: StoredConversationState = {
      currentFlow: transition.nextFlow,
      currentStep: transition.nextStep,
      context: transition.nextContext,
    };
    let outboundMessages = transition.outbound;

    if (transition.intent) {
      const effect = await createEffectForIntent({
        db: tx,
        runtime,
        intent: transition.intent,
        conversationId: conversation.id,
        restaurantId: conversation.restaurantId,
        customerId: conversation.customerId,
        state: nextState,
      });

      nextState = applyEffectToState(nextState, transition.intent, effect);
      outboundMessages = buildPostIntentMessages(
        transition.intent,
        runtime,
        nextState.context,
        effect,
      );
    }

    await appendConversationMessages(tx, {
      restaurantId: conversation.restaurantId,
      conversationId: conversation.id,
      messages: outboundMessages,
    });

    await updateConversationState(tx, {
      conversationId: conversation.id,
      summary: transition.summary,
      state: nextState,
    });

    return { conversationId: conversation.id };
  });

  emitConversationMessageAppended(conversationId);
}

export async function resetPrimaryDemoChat(conversationId?: string) {
  const { conversationId: resolvedId } = await prisma.$transaction(async (tx) => {
    const primaryConversation = await ensureDemoChatConversation(tx);
    const targetId = conversationId ?? primaryConversation.id;
    await resetDemoChatConversation(tx, targetId);
    return { conversationId: targetId };
  });

  emitConversationMessageAppended(resolvedId);
}

export async function startNewPrimaryDemoChat() {
  const { conversationId } = await prisma.$transaction(async (tx) => {
    const conversation = await startFreshDemoChatConversation(tx);
    return { conversationId: conversation.id };
  });

  emitConversationMessageAppended(conversationId);
}

export async function simulatePaymentSuccess(orderId?: string) {
  const result = await prisma.$transaction(async (tx) => {
    const order = await getTargetOrder(tx, orderId);
    if (!order) {
      return null;
    }

    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus: PaymentStatus.SUCCESS,
      },
    });

    await upsertPaymentRecord(tx, {
      restaurantId: order.restaurantId,
      orderId: order.id,
      amountInPaise: order.totalInPaise,
      status: PaymentStatus.SUCCESS,
      reference: `${order.orderNumber}-PAY`,
    });

    const conversation = await ensureOrderConversation(tx, order);
    await appendConversationUpdate(tx, {
      restaurantId: order.restaurantId,
      conversationId: conversation.id,
      summary: `Payment successful for ${order.orderNumber}.`,
      messages: [
        systemMessage("Payment successful"),
        statusCard({
          title: "Payment received",
          subtitle: order.orderNumber,
          badge: "Success",
          tone: "emerald",
          rows: [
            { label: "Order", value: order.orderNumber },
            { label: "Payment status", value: "Success" },
            { label: "Next step", value: "Ready for approval" },
          ],
          footnote: "The order can now be approved and pushed through preparation.",
        }),
      ],
    });

    return { conversationId: conversation.id };
  });

  if (result) emitConversationMessageAppended(result.conversationId);
}

export async function simulatePaymentFailure(orderId?: string) {
  const result = await prisma.$transaction(async (tx) => {
    const order = await getTargetOrder(tx, orderId);
    if (!order) {
      return null;
    }

    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus: PaymentStatus.FAILED,
      },
    });

    await upsertPaymentRecord(tx, {
      restaurantId: order.restaurantId,
      orderId: order.id,
      amountInPaise: order.totalInPaise,
      status: PaymentStatus.FAILED,
      reference: `${order.orderNumber}-PAY`,
      failureReason: "Manual control-panel simulation",
    });

    const conversation = await ensureOrderConversation(tx, order);
    await appendConversationUpdate(tx, {
      restaurantId: order.restaurantId,
      conversationId: conversation.id,
      summary: `Payment failed for ${order.orderNumber}.`,
      messages: [
        systemMessage("Payment failed"),
        statusCard({
          title: "Payment failed",
          subtitle: order.orderNumber,
          badge: "Retry needed",
          tone: "amber",
          rows: [
            { label: "Order", value: order.orderNumber },
            { label: "Payment status", value: "Failed" },
            { label: "Next step", value: "Retry or new request" },
          ],
          footnote: "This keeps the order in a pending payment state for the demo.",
        }),
      ],
    });

    return { conversationId: conversation.id };
  });

  if (result) emitConversationMessageAppended(result.conversationId);
}

async function updateOrderStatus(
  db: DbClient,
  args: {
    orderId?: string;
    nextStatus: OrderStatus;
    systemText: string;
    badge: string;
    footnote: string;
    summary: string;
  },
) {
  const order = await getTargetOrder(db, args.orderId);
  if (!order) {
    return null;
  }

  await db.order.update({
    where: {
      id: order.id,
    },
    data: {
      status: args.nextStatus,
      readyAt: args.nextStatus === OrderStatus.READY ? new Date() : order.readyAt,
      deliveredAt: args.nextStatus === OrderStatus.COMPLETED ? new Date() : order.deliveredAt,
    },
  });

  const conversation = await ensureOrderConversation(db, order);
  await appendConversationUpdate(db, {
    restaurantId: order.restaurantId,
    conversationId: conversation.id,
    summary: `${args.summary} ${order.orderNumber}.`,
    messages: [
      systemMessage(args.systemText),
      statusCard({
        title: "Order status updated",
        subtitle: order.orderNumber,
        badge: args.badge,
        tone: args.nextStatus === OrderStatus.COMPLETED ? "emerald" : "amber",
        rows: [
          { label: "Order", value: order.orderNumber },
          {
            label: "Current status",
            value: args.nextStatus === OrderStatus.COMPLETED ? "Delivered" : args.nextStatus.replaceAll("_", " "),
          },
          { label: "Customer", value: order.customer?.firstName ?? "Guest" },
        ],
        footnote: args.footnote,
      }),
    ],
  });

  return { conversationId: conversation.id };
}

export async function markOrderApproved(orderId?: string) {
  const result = await prisma.$transaction((tx) =>
    updateOrderStatus(tx, {
      orderId,
      nextStatus: OrderStatus.CONFIRMED,
      systemText: "Order approved",
      badge: "Confirmed",
      footnote: "The kitchen can now begin preparation.",
      summary: "Order approved",
    }),
  );

  if (result) emitConversationMessageAppended(result.conversationId);
}

export async function markOrderPreparing(orderId?: string) {
  const result = await prisma.$transaction((tx) =>
    updateOrderStatus(tx, {
      orderId,
      nextStatus: OrderStatus.PREPARING,
      systemText: "Order moved to preparing",
      badge: "Preparing",
      footnote: "The kitchen is now actively preparing the order.",
      summary: "Order preparing",
    }),
  );

  if (result) emitConversationMessageAppended(result.conversationId);
}

export async function markOrderReady(orderId?: string) {
  const result = await prisma.$transaction((tx) =>
    updateOrderStatus(tx, {
      orderId,
      nextStatus: OrderStatus.READY,
      systemText: "Order is ready",
      badge: "Ready",
      footnote: "The order is ready for pickup, handoff, or delivery dispatch.",
      summary: "Order ready",
    }),
  );

  if (result) emitConversationMessageAppended(result.conversationId);
}

export async function markOrderDelivered(orderId?: string) {
  const result = await prisma.$transaction((tx) =>
    updateOrderStatus(tx, {
      orderId,
      nextStatus: OrderStatus.COMPLETED,
      systemText: "Order delivered",
      badge: "Delivered",
      footnote: "The order lifecycle is complete in the simulator.",
      summary: "Order delivered",
    }),
  );

  if (result) emitConversationMessageAppended(result.conversationId);
}

export async function createSampleBookingRequest() {
  const { conversationId } = await prisma.$transaction(async (tx) => {
    const runtime = await getDemoChatRuntime(tx);
    if (!runtime.customer.id) {
      throw new Error("Demo customer not found.");
    }

    const conversation = await getPrimaryConversation(tx);
    const bookingReference = stampReference("BK");
    const bookingDateTime = new Date(Date.now() + 1000 * 60 * 60 * 28);

    const booking = await tx.tableBooking.create({
      data: {
        restaurantId: runtime.restaurant.id,
        customerId: runtime.customer.id,
        bookingReference,
        guestCount: 6,
        bookingDateTime,
        status: BookingStatus.PENDING,
        seatingPreference: "Indoor",
        specialOccasion: "Control-panel sample booking",
        source: "demo-control",
        notes: "Sample booking request created from the control panel.",
      },
    });

    await tx.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        bookingId: booking.id,
      },
    });

    await appendConversationUpdate(tx, {
      restaurantId: runtime.restaurant.id,
      conversationId: conversation.id,
      summary: `Booking request sent for ${bookingReference}.`,
      messages: [
        systemMessage("Booking request sent"),
        statusCard({
          title: "Booking request submitted",
          subtitle: bookingReference,
          badge: "Pending",
          tone: "amber",
          rows: [
            { label: "Guests", value: "6" },
            { label: "Seating", value: "Indoor" },
            { label: "Status", value: "Pending approval" },
          ],
          footnote: "The host team can now confirm or complete this booking from the control panel.",
        }),
      ],
    });

    return { conversationId: conversation.id };
  });

  emitConversationMessageAppended(conversationId);
}

async function updateBookingStatus(
  db: DbClient,
  args: {
    bookingId?: string;
    nextStatus: BookingStatus;
    systemText: string;
    badge: string;
    summary: string;
  },
) {
  const booking = await getTargetBooking(db, args.bookingId);
  if (!booking) {
    return null;
  }

  await db.tableBooking.update({
    where: {
      id: booking.id,
    },
    data: {
      status: args.nextStatus,
    },
  });

  const conversation = await ensureBookingConversation(db, booking);
  await appendConversationUpdate(db, {
    restaurantId: booking.restaurantId,
    conversationId: conversation.id,
    summary: `${args.summary} ${booking.bookingReference}.`,
    messages: [
      systemMessage(args.systemText),
      statusCard({
        title: "Booking status updated",
        subtitle: booking.bookingReference,
        badge: args.badge,
        tone: args.nextStatus === BookingStatus.COMPLETED ? "emerald" : "amber",
        rows: [
          { label: "Booking", value: booking.bookingReference },
          { label: "Guests", value: `${booking.guestCount}` },
          { label: "Status", value: args.nextStatus.replaceAll("_", " ") },
        ],
        footnote:
          args.nextStatus === BookingStatus.CONFIRMED
            ? "The guest can now be informed that the table is confirmed."
            : "The booking lifecycle is complete in the simulator.",
      }),
    ],
  });

  return { conversationId: conversation.id };
}

export async function confirmBooking(bookingId?: string) {
  const result = await prisma.$transaction((tx) =>
    updateBookingStatus(tx, {
      bookingId,
      nextStatus: BookingStatus.CONFIRMED,
      systemText: "Booking confirmed",
      badge: "Confirmed",
      summary: "Booking confirmed",
    }),
  );

  if (result) emitConversationMessageAppended(result.conversationId);
}

export async function completeBooking(bookingId?: string) {
  const result = await prisma.$transaction((tx) =>
    updateBookingStatus(tx, {
      bookingId,
      nextStatus: BookingStatus.COMPLETED,
      systemText: "Booking completed",
      badge: "Completed",
      summary: "Booking completed",
    }),
  );

  if (result) emitConversationMessageAppended(result.conversationId);
}

export async function createSampleEventInquiry() {
  const { conversationId } = await prisma.$transaction(async (tx) => {
    const runtime = await getDemoChatRuntime(tx);
    if (!runtime.customer.id) {
      throw new Error("Demo customer not found.");
    }

    const conversation = await getPrimaryConversation(tx);
    const inquiryReference = stampReference("EV");

    const event = await tx.eventInquiry.create({
      data: {
        restaurantId: runtime.restaurant.id,
        customerId: runtime.customer.id,
        inquiryReference,
        eventType: "Wedding Reception",
        guestCount: 120,
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
        budgetRange: "INR 4L - 6L",
        status: EventInquiryStatus.NEW,
        venuePreference: "Full buyout",
        source: "demo-control",
        notes: "Sample event inquiry created from the control panel.",
      },
    });

    await tx.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        eventInquiryId: event.id,
      },
    });

    await appendConversationUpdate(tx, {
      restaurantId: runtime.restaurant.id,
      conversationId: conversation.id,
      summary: `Event inquiry submitted for ${inquiryReference}.`,
      messages: [
        systemMessage("Our team will contact you"),
        statusCard({
          title: "Event inquiry submitted",
          subtitle: inquiryReference,
          badge: "New lead",
          tone: "amber",
          rows: [
            { label: "Event", value: "Wedding Reception" },
            { label: "Guests", value: "120" },
            { label: "Budget", value: "INR 4L - 6L" },
          ],
          footnote: "The events team can now move this lead to contacted, quoted, or confirmed.",
        }),
      ],
    });

    return { conversationId: conversation.id };
  });

  emitConversationMessageAppended(conversationId);
}

async function updateEventStatus(
  db: DbClient,
  args: {
    inquiryId?: string;
    nextStatus: EventInquiryStatus;
    systemText: string;
    badge: string;
    summary: string;
  },
) {
  const event = await getTargetEvent(db, args.inquiryId);
  if (!event) {
    return null;
  }

  await db.eventInquiry.update({
    where: {
      id: event.id,
    },
    data: {
      status: args.nextStatus,
    },
  });

  const conversation = await ensureEventConversation(db, event);
  await appendConversationUpdate(db, {
    restaurantId: event.restaurantId,
    conversationId: conversation.id,
    summary: `${args.summary} ${event.inquiryReference}.`,
    messages: [
      systemMessage(args.systemText),
      statusCard({
        title: "Event inquiry updated",
        subtitle: event.inquiryReference,
        badge: args.badge,
        tone: args.nextStatus === EventInquiryStatus.CONFIRMED ? "emerald" : "amber",
        rows: [
          { label: "Inquiry", value: event.inquiryReference },
          { label: "Event type", value: event.eventType },
          {
            label: "Status",
            value:
              args.nextStatus === EventInquiryStatus.PROPOSAL_SENT
                ? "Quoted"
                : args.nextStatus.replaceAll("_", " "),
          },
        ],
        footnote:
          args.nextStatus === EventInquiryStatus.CONTACTED
            ? "A coordinator has made first contact with the guest."
            : args.nextStatus === EventInquiryStatus.PROPOSAL_SENT
              ? "A proposal or quote has been sent to the guest."
              : "The event inquiry is now marked as confirmed.",
      }),
    ],
  });

  return { conversationId: conversation.id };
}

export async function markEventContacted(inquiryId?: string) {
  const result = await prisma.$transaction((tx) =>
    updateEventStatus(tx, {
      inquiryId,
      nextStatus: EventInquiryStatus.CONTACTED,
      systemText: "Event inquiry contacted",
      badge: "Contacted",
      summary: "Event inquiry contacted",
    }),
  );

  if (result) emitConversationMessageAppended(result.conversationId);
}

export async function markEventQuoted(inquiryId?: string) {
  const result = await prisma.$transaction((tx) =>
    updateEventStatus(tx, {
      inquiryId,
      nextStatus: EventInquiryStatus.PROPOSAL_SENT,
      systemText: "Quote shared with guest",
      badge: "Quoted",
      summary: "Event inquiry quoted",
    }),
  );

  if (result) emitConversationMessageAppended(result.conversationId);
}

export async function markEventConfirmed(inquiryId?: string) {
  const result = await prisma.$transaction((tx) =>
    updateEventStatus(tx, {
      inquiryId,
      nextStatus: EventInquiryStatus.CONFIRMED,
      systemText: "Event confirmed",
      badge: "Confirmed",
      summary: "Event inquiry confirmed",
    }),
  );

  if (result) emitConversationMessageAppended(result.conversationId);
}
