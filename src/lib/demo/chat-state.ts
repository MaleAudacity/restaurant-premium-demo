import { ConversationChannel, ConversationStatus, Prisma } from "@prisma/client";

import { DEFAULT_RESTAURANT_SLUG } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

import { createInitialConversationTransition } from "@/lib/demo/chat-engine";
import {
  ChatFlow,
  ChatRuntimeData,
  ChatStep,
  DEMO_CHAT_EXTERNAL_REF,
  createEmptyConversationContext,
  type ChatDraftMessage,
  type ChatMessageMetadata,
  type StoredConversationState,
} from "@/lib/demo/chat-types";

type DbClient = Prisma.TransactionClient | typeof prisma;

function joinAddress(
  address:
    | {
        line1: string;
        line2?: string | null;
        city: string;
        state: string;
        postalCode: string;
      }
    | null
    | undefined,
) {
  if (!address) {
    return null;
  }

  return [address.line1, address.line2, address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(", ");
}

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function parseContextJson(value: Prisma.JsonValue | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return createEmptyConversationContext();
  }

  const parsed = value as Partial<StoredConversationState["context"]>;
  const empty = createEmptyConversationContext();

  return {
    order: {
      ...empty.order,
      ...(parsed.order ?? {}),
      cart: Array.isArray(parsed.order?.cart) ? parsed.order.cart : [],
    },
    tableBooking: {
      ...empty.tableBooking,
      ...(parsed.tableBooking ?? {}),
    },
    birthdayParty: {
      ...empty.birthdayParty,
      ...(parsed.birthdayParty ?? {}),
    },
    weddingEvent: {
      ...empty.weddingEvent,
      ...(parsed.weddingEvent ?? {}),
    },
    menu: {
      ...empty.menu,
      ...(parsed.menu ?? {}),
    },
  };
}

export function readConversationState(conversation: {
  currentFlow: string;
  currentStep: string;
  contextJson: Prisma.JsonValue | null;
}): StoredConversationState {
  return {
    currentFlow:
      (Object.values(ChatFlow) as string[]).includes(conversation.currentFlow)
        ? (conversation.currentFlow as StoredConversationState["currentFlow"])
        : ChatFlow.WELCOME,
    currentStep:
      (Object.values(ChatStep) as string[]).includes(conversation.currentStep)
        ? (conversation.currentStep as StoredConversationState["currentStep"])
        : ChatStep.WELCOME_ROOT,
    context: parseContextJson(conversation.contextJson),
  };
}

export function parseMessageMetadata(value: Prisma.JsonValue | null | undefined): ChatMessageMetadata | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as ChatMessageMetadata;
}

function serializeMessageMetadata(metadata?: ChatMessageMetadata | null) {
  return metadata ? toInputJson(metadata) : Prisma.JsonNull;
}

export async function appendConversationMessages(
  db: DbClient,
  args: {
    restaurantId: string;
    conversationId: string;
    messages: ChatDraftMessage[];
  },
) {
  const baseTime = Date.now();

  for (const [index, message] of args.messages.entries()) {
    await db.messageLog.create({
      data: {
        restaurantId: args.restaurantId,
        conversationId: args.conversationId,
        direction: message.direction ?? "OUTBOUND",
        messageType: message.messageType ?? "TEXT",
        content: message.content,
        quickReplyKey: message.quickReplyKey ?? null,
        metadata: serializeMessageMetadata(message.metadata),
        createdAt: new Date(baseTime + index * 1000),
      },
    });
  }
}

export async function updateConversationState(
  db: DbClient,
  args: {
    conversationId: string;
    summary: string;
    state: StoredConversationState;
    lastMessageAt?: Date;
  },
) {
  return db.conversation.update({
    where: {
      id: args.conversationId,
    },
    data: {
      summary: args.summary,
      currentFlow: args.state.currentFlow,
      currentStep: args.state.currentStep,
      contextJson: toInputJson(args.state.context),
      lastMessageAt: args.lastMessageAt ?? new Date(),
    },
  });
}

async function ensureDemoCustomer(db: DbClient, restaurantId: string) {
  const existingCustomer = await db.customer.findFirst({
    where: {
      restaurantId,
    },
    include: {
      addresses: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existingCustomer) {
    return existingCustomer;
  }

  const fallbackCustomer = await db.customer.create({
    data: {
      restaurantId,
      firstName: "Ishita",
      lastName: "Rao",
      phone: "+91 90000 10001",
      email: "ishita.rao@example.com",
      notes: "Primary guided WhatsApp demo guest.",
      preferredChannel: ConversationChannel.WHATSAPP,
    },
  });

  await db.customerAddress.create({
    data: {
      restaurantId,
      customerId: fallbackCustomer.id,
      label: "Home",
      line1: "28 Lavelle Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      country: "India",
      isDefault: true,
    },
  });

  return db.customer.findUniqueOrThrow({
    where: {
      id: fallbackCustomer.id,
    },
    include: {
      addresses: true,
    },
  });
}

export async function getDemoChatRuntime(db: DbClient = prisma): Promise<ChatRuntimeData> {
  const restaurant = await db.restaurant.findUnique({
    where: {
      slug: DEFAULT_RESTAURANT_SLUG,
    },
    include: {
      businessHours: {
        orderBy: {
          dayOfWeek: "asc",
        },
      },
      deliveryZones: {
        orderBy: {
          deliveryFeeInPaise: "asc",
        },
      },
      categories: {
        where: {
          isActive: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
      menuItems: {
        where: {
          isAvailable: true,
        },
      },
    },
  });

  if (!restaurant) {
    throw new Error("Mirch Masala restaurant not found. Seed the database first.");
  }

  const customer = await ensureDemoCustomer(db, restaurant.id);
  const defaultAddress =
    joinAddress(customer.addresses.find((entry) => entry.isDefault) ?? customer.addresses[0]) ?? null;
  const primaryZone = restaurant.deliveryZones[0];

  return {
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      phone: restaurant.phone,
      whatsappNumber: restaurant.whatsappNumber,
      currency: restaurant.currency,
      addressLine1: restaurant.addressLine1,
      addressLine2: restaurant.addressLine2,
      city: restaurant.city,
      state: restaurant.state,
      postalCode: restaurant.postalCode,
    },
    customer: {
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName ?? ""}`.trim(),
      phone: customer.phone,
      notes: customer.notes,
      defaultAddress,
    },
    categories: restaurant.categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
    })),
    items: restaurant.menuItems.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      slug: item.slug,
      name: item.name,
      description: item.description,
      priceInPaise: item.priceInPaise,
      isFeatured: item.isFeatured,
      isVegetarian: item.isVegetarian,
      prepTimeMinutes: item.prepTimeMinutes,
    })),
    businessHours: restaurant.businessHours.map((hour) => ({
      dayOfWeek: hour.dayOfWeek,
      opensAt: hour.opensAt,
      closesAt: hour.closesAt,
      isClosed: hour.isClosed,
    })),
    deliveryFeeInPaise: primaryZone?.deliveryFeeInPaise ?? 9900,
    deliveryEtaMinutes: primaryZone?.estimatedMinutes ?? 35,
  };
}

async function bootstrapConversationIfEmpty(
  db: DbClient,
  args: {
    restaurantId: string;
    conversationId: string;
  },
) {
  const existingMessages = await db.messageLog.count({
    where: {
      conversationId: args.conversationId,
    },
  });

  if (existingMessages > 0) {
    return;
  }

  const initial = createInitialConversationTransition();

  await appendConversationMessages(db, {
    restaurantId: args.restaurantId,
    conversationId: args.conversationId,
    messages: initial.outbound,
  });

  await updateConversationState(db, {
    conversationId: args.conversationId,
    summary: initial.summary,
    state: {
      currentFlow: initial.nextFlow,
      currentStep: initial.nextStep,
      context: initial.nextContext,
    },
  });
}

export async function ensureDemoChatConversation(db: DbClient = prisma) {
  const runtime = await getDemoChatRuntime(db);

  let conversation = await db.conversation.findFirst({
    where: {
      restaurantId: runtime.restaurant.id,
      externalRef: DEMO_CHAT_EXTERNAL_REF,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!conversation) {
    const initial = createInitialConversationTransition();

    conversation = await db.conversation.create({
      data: {
        restaurantId: runtime.restaurant.id,
        customerId: runtime.customer.id,
        channel: ConversationChannel.WHATSAPP,
        status: ConversationStatus.OPEN,
        externalRef: DEMO_CHAT_EXTERNAL_REF,
        summary: initial.summary,
        currentFlow: initial.nextFlow,
        currentStep: initial.nextStep,
        contextJson: toInputJson(initial.nextContext),
        lastMessageAt: new Date(),
      },
    });
  }

  await bootstrapConversationIfEmpty(db, {
    restaurantId: runtime.restaurant.id,
    conversationId: conversation.id,
  });

  return db.conversation.findUniqueOrThrow({
    where: {
      id: conversation.id,
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
}

export async function resetDemoChatConversation(db: DbClient, conversationId: string) {
  const conversation = await db.conversation.findUnique({
    where: {
      id: conversationId,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  await db.messageLog.deleteMany({
    where: {
      conversationId,
    },
  });

  const initial = createInitialConversationTransition();

  await updateConversationState(db, {
    conversationId,
    summary: initial.summary,
    state: {
      currentFlow: initial.nextFlow,
      currentStep: initial.nextStep,
      context: initial.nextContext,
    },
  });

  await db.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      bookingId: null,
      eventInquiryId: null,
      status: ConversationStatus.OPEN,
    },
  });

  await appendConversationMessages(db, {
    restaurantId: conversation.restaurantId,
    conversationId,
    messages: initial.outbound,
  });

  return db.conversation.findUniqueOrThrow({
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
}

export async function startFreshDemoChatConversation(db: DbClient = prisma) {
  const runtime = await getDemoChatRuntime(db);
  const initial = createInitialConversationTransition();

  await db.conversation.updateMany({
    where: {
      restaurantId: runtime.restaurant.id,
      externalRef: DEMO_CHAT_EXTERNAL_REF,
    },
    data: {
      externalRef: null,
      status: ConversationStatus.ARCHIVED,
    },
  });

  const conversation = await db.conversation.create({
    data: {
      restaurantId: runtime.restaurant.id,
      customerId: runtime.customer.id,
      channel: ConversationChannel.WHATSAPP,
      status: ConversationStatus.OPEN,
      externalRef: DEMO_CHAT_EXTERNAL_REF,
      summary: initial.summary,
      currentFlow: initial.nextFlow,
      currentStep: initial.nextStep,
      contextJson: toInputJson(initial.nextContext),
      lastMessageAt: new Date(),
    },
  });

  await appendConversationMessages(db, {
    restaurantId: runtime.restaurant.id,
    conversationId: conversation.id,
    messages: initial.outbound,
  });

  return db.conversation.findUniqueOrThrow({
    where: {
      id: conversation.id,
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
}
