import { unstable_noStore as noStore } from "next/cache";

import { isDatabaseReachable } from "@/lib/database-status";
import { createInitialConversationTransition } from "@/lib/demo/chat-engine";
import {
  ensureDemoChatConversation,
  getDemoChatRuntime,
  parseMessageMetadata,
  readConversationState,
} from "@/lib/demo/chat-state";
import { type DemoChatPageData } from "@/lib/demo/chat-types";
import { demoCustomers, demoRestaurant } from "@/lib/demo/demo-data";

function buildFallbackData(): DemoChatPageData {
  const customer = demoCustomers[0];
  const initial = createInitialConversationTransition();
  const prompt = initial.outbound.find((message) => message.metadata?.prompt)?.metadata?.prompt ?? null;

  return {
    isReadonlyFallback: true,
    conversationId: "fallback-demo-chat",
    currentFlow: initial.nextFlow,
    currentStep: initial.nextStep,
    summary: initial.summary,
    customer: {
      name: `${customer.firstName} ${customer.lastName ?? ""}`.trim(),
      phone: customer.phone,
      notes: customer.notes,
    },
    restaurant: {
      name: demoRestaurant.name,
      phone: demoRestaurant.phone,
      whatsappNumber: demoRestaurant.whatsapp,
    },
    messages: initial.outbound.map((message, index) => ({
      id: `fallback-${index + 1}`,
      direction: message.direction ?? "OUTBOUND",
      messageType: message.messageType ?? "TEXT",
      content: message.content,
      createdAt: new Date(Date.now() + index * 1000).toISOString(),
      metadata: message.metadata ?? null,
    })),
    activePrompt: prompt,
  };
}

export async function getDemoChatPageData(): Promise<DemoChatPageData> {
  noStore();

  if (!(await isDatabaseReachable())) {
    return buildFallbackData();
  }

  try {
    const [runtime, conversation] = await Promise.all([
      getDemoChatRuntime(),
      ensureDemoChatConversation(),
    ]);

    const state = readConversationState(conversation);
    const messages = conversation.messages.map((message) => ({
      id: message.id,
      direction: message.direction,
      messageType: message.messageType,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      metadata: parseMessageMetadata(message.metadata),
    }));
    const activePrompt =
      [...messages].reverse().find((message) => message.metadata?.prompt)?.metadata?.prompt ?? null;

    return {
      isReadonlyFallback: false,
      conversationId: conversation.id,
      currentFlow: state.currentFlow,
      currentStep: state.currentStep,
      summary: conversation.summary ?? "Guided WhatsApp concierge ready.",
      customer: {
        name: conversation.customer
          ? `${conversation.customer.firstName} ${conversation.customer.lastName ?? ""}`.trim()
          : runtime.customer.name,
        phone: conversation.customer?.phone ?? runtime.customer.phone,
        notes: conversation.customer?.notes ?? runtime.customer.notes,
      },
      restaurant: {
        name: runtime.restaurant.name,
        phone: runtime.restaurant.phone,
        whatsappNumber: runtime.restaurant.whatsappNumber,
      },
      messages,
      activePrompt,
    };
  } catch {
    return {
      ...buildFallbackData(),
      customer: {
        name: `${demoCustomers[0].firstName} ${demoCustomers[0].lastName ?? ""}`.trim(),
        phone: demoCustomers[0].phone,
        notes: demoCustomers[0].notes,
      },
      restaurant: {
        name: demoRestaurant.name,
        phone: demoRestaurant.phone,
        whatsappNumber: demoRestaurant.whatsapp,
      },
    };
  }
}
