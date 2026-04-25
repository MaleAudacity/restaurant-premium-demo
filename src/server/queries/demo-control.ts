import { unstable_noStore as noStore } from "next/cache";

import { isDatabaseReachable } from "@/lib/database-status";
import { ensureDemoChatConversation, getDemoChatRuntime, readConversationState } from "@/lib/demo/chat-state";
import { prisma } from "@/lib/prisma";

export async function getDemoControlPageData() {
  noStore();

  if (!(await isDatabaseReachable())) {
    return {
      isReadonlyFallback: true,
      conversation: null,
      currentOrder: null,
      currentBooking: null,
      currentEvent: null,
      counts: {
        orders: 0,
        bookings: 0,
        events: 0,
      },
    };
  }

  const runtime = await getDemoChatRuntime();
  const conversation = await ensureDemoChatConversation();
  const state = readConversationState(conversation);

  const [orders, bookings, events] = await Promise.all([
    prisma.order.findMany({
      where: {
        restaurantId: runtime.restaurant.id,
      },
      include: {
        customer: true,
        items: true,
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        placedAt: "desc",
      },
    }),
    prisma.tableBooking.findMany({
      where: {
        restaurantId: runtime.restaurant.id,
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.eventInquiry.findMany({
      where: {
        restaurantId: runtime.restaurant.id,
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const currentOrder =
    orders.find((order) => order.conversationId === conversation.id) ?? orders[0] ?? null;
  const currentBooking =
    (conversation.bookingId ? bookings.find((booking) => booking.id === conversation.bookingId) : null)
    ?? bookings[0]
    ?? null;
  const currentEvent =
    (conversation.eventInquiryId ? events.find((event) => event.id === conversation.eventInquiryId) : null)
    ?? events[0]
    ?? null;

  return {
    isReadonlyFallback: false,
    conversation: {
      id: conversation.id,
      customerName: conversation.customer
        ? `${conversation.customer.firstName} ${conversation.customer.lastName ?? ""}`.trim()
        : runtime.customer.name,
      customerPhone: conversation.customer?.phone ?? runtime.customer.phone,
      summary: conversation.summary ?? "Guided WhatsApp concierge ready.",
      currentFlow: state.currentFlow,
      currentStep: state.currentStep,
      messageCount: conversation.messages.length,
    },
    currentOrder,
    currentBooking,
    currentEvent,
    counts: {
      orders: orders.length,
      bookings: bookings.length,
      events: events.length,
    },
  };
}

export type DemoControlPageData = Awaited<ReturnType<typeof getDemoControlPageData>>;
