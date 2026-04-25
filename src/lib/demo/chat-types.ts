export const DEMO_CHAT_EXTERNAL_REF = "demo-chat-primary";

export const ChatFlow = {
  WELCOME: "WELCOME",
  ORDER_FOOD: "ORDER_FOOD",
  TABLE_BOOKING: "TABLE_BOOKING",
  BIRTHDAY_PARTY: "BIRTHDAY_PARTY",
  WEDDING_EVENT: "WEDDING_EVENT",
  MENU_PRICE_LIST: "MENU_PRICE_LIST",
  CONTACT_INFO: "CONTACT_INFO",
} as const;

export type ChatFlow = (typeof ChatFlow)[keyof typeof ChatFlow];

export const ChatStep = {
  WELCOME_ROOT: "WELCOME_ROOT",
  ORDER_CATEGORY: "ORDER_CATEGORY",
  ORDER_ITEM: "ORDER_ITEM",
  ORDER_QUANTITY: "ORDER_QUANTITY",
  ORDER_NEXT_ACTION: "ORDER_NEXT_ACTION",
  ORDER_TYPE: "ORDER_TYPE",
  ORDER_DETAILS: "ORDER_DETAILS",
  ORDER_SUMMARY: "ORDER_SUMMARY",
  ORDER_PAYMENT_PENDING: "ORDER_PAYMENT_PENDING",
  BOOKING_DATE: "BOOKING_DATE",
  BOOKING_TIME: "BOOKING_TIME",
  BOOKING_GUEST_COUNT: "BOOKING_GUEST_COUNT",
  BOOKING_SEATING: "BOOKING_SEATING",
  BOOKING_SPECIAL_REQUEST: "BOOKING_SPECIAL_REQUEST",
  BOOKING_SUMMARY: "BOOKING_SUMMARY",
  BOOKING_PENDING_APPROVAL: "BOOKING_PENDING_APPROVAL",
  PARTY_DATE: "PARTY_DATE",
  PARTY_GUEST_COUNT: "PARTY_GUEST_COUNT",
  PARTY_BUDGET: "PARTY_BUDGET",
  PARTY_FOOD_PREFERENCE: "PARTY_FOOD_PREFERENCE",
  PARTY_DECORATION: "PARTY_DECORATION",
  PARTY_SUMMARY: "PARTY_SUMMARY",
  PARTY_CALLBACK_CONFIRMED: "PARTY_CALLBACK_CONFIRMED",
  WEDDING_EVENT_TYPE: "WEDDING_EVENT_TYPE",
  WEDDING_DATE: "WEDDING_DATE",
  WEDDING_GUEST_COUNT: "WEDDING_GUEST_COUNT",
  WEDDING_BUDGET: "WEDDING_BUDGET",
  WEDDING_NOTES: "WEDDING_NOTES",
  WEDDING_SUMMARY: "WEDDING_SUMMARY",
  WEDDING_SUBMITTED: "WEDDING_SUBMITTED",
  MENU_CATEGORY: "MENU_CATEGORY",
  MENU_BROWSING: "MENU_BROWSING",
  CONTACT_DETAILS: "CONTACT_DETAILS",
} as const;

export type ChatStep = (typeof ChatStep)[keyof typeof ChatStep];

export type ChatQuickReply = {
  key: string;
  label: string;
  description?: string;
  emphasis?: "primary" | "secondary" | "success" | "muted";
};

export type ChatCard = {
  kind: "summary" | "status" | "list" | "contact";
  tone?: "amber" | "emerald" | "stone";
  title: string;
  subtitle?: string;
  badge?: string;
  rows?: Array<{ label: string; value: string }>;
  items?: Array<{ title: string; description?: string; meta?: string; badge?: string }>;
  footnote?: string;
};

export type ChatMessageMetadata = {
  prompt?: {
    options: ChatQuickReply[];
    presentation?: "chips" | "list";
    inputPlaceholder?: string;
    helpText?: string;
    allowFreeText?: boolean;
  };
  card?: ChatCard;
};

export type ChatDraftMessage = {
  direction?: "OUTBOUND" | "INBOUND" | "SYSTEM";
  messageType?: string;
  content: string;
  quickReplyKey?: string | null;
  metadata?: ChatMessageMetadata | null;
};

export type OrderCartLine = {
  itemId: string;
  itemName: string;
  categoryName: string;
  quantity: number;
  unitPriceInPaise: number;
  prepTimeMinutes?: number | null;
};

export type OrderFlowContext = {
  selectedCategoryId?: string;
  selectedCategoryName?: string;
  selectedItemId?: string;
  selectedItemName?: string;
  selectedItemPriceInPaise?: number;
  selectedItemPrepTimeMinutes?: number | null;
  cart: OrderCartLine[];
  orderType?: "DELIVERY" | "PICKUP" | "DINE_IN";
  addressOrNote?: string;
  recordId?: string;
  orderNumber?: string;
  paymentStatusLabel?: string;
};

export type TableBookingFlowContext = {
  dateLabel?: string;
  dateValue?: string;
  timeLabel?: string;
  guestCount?: number;
  seatingPreference?: string;
  specialRequest?: string;
  recordId?: string;
  bookingReference?: string;
};

export type BirthdayPartyFlowContext = {
  dateLabel?: string;
  dateValue?: string;
  guestCount?: number;
  budgetRange?: string;
  foodPreference?: string;
  decorationRequired?: boolean;
  recordId?: string;
  inquiryReference?: string;
};

export type WeddingEventFlowContext = {
  eventType?: string;
  dateLabel?: string;
  dateValue?: string;
  guestCount?: number;
  budgetRange?: string;
  notes?: string;
  recordId?: string;
  inquiryReference?: string;
};

export type MenuFlowContext = {
  selectedCategoryId?: string;
  selectedCategoryName?: string;
};

export type ConversationContext = {
  order: OrderFlowContext;
  tableBooking: TableBookingFlowContext;
  birthdayParty: BirthdayPartyFlowContext;
  weddingEvent: WeddingEventFlowContext;
  menu: MenuFlowContext;
};

export type StoredConversationState = {
  currentFlow: ChatFlow;
  currentStep: ChatStep;
  context: ConversationContext;
};

export type ChatInput = {
  value: string;
  quickReplyKey?: string | null;
};

export type ChatRuntimeData = {
  restaurant: {
    id: string;
    name: string;
    phone: string;
    whatsappNumber?: string | null;
    currency: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
  };
  customer: {
    id?: string;
    name: string;
    phone: string;
    notes?: string | null;
    defaultAddress?: string | null;
  };
  categories: Array<{
    id: string;
    slug: string;
    name: string;
    description?: string | null;
  }>;
  items: Array<{
    id: string;
    categoryId: string;
    slug: string;
    name: string;
    description?: string | null;
    priceInPaise: number;
    isFeatured: boolean;
    isVegetarian: boolean;
    prepTimeMinutes?: number | null;
  }>;
  businessHours: Array<{
    dayOfWeek: number;
    opensAt: string;
    closesAt: string;
    isClosed: boolean;
  }>;
  deliveryFeeInPaise: number;
  deliveryEtaMinutes: number;
};

export type ChatRecordIntent =
  | { type: "CREATE_ORDER_PENDING" }
  | { type: "CREATE_TABLE_BOOKING" }
  | { type: "CREATE_PARTY_INQUIRY" }
  | { type: "CREATE_WEDDING_INQUIRY" };

export type ChatTransition = {
  nextFlow: ChatFlow;
  nextStep: ChatStep;
  nextContext: ConversationContext;
  summary: string;
  outbound: ChatDraftMessage[];
  intent?: ChatRecordIntent | null;
};

export type ChatEffectResult = {
  id: string;
  reference: string;
  totalInPaise?: number;
  statusLabel?: string;
};

export type DemoChatMessage = {
  id: string;
  direction: "INBOUND" | "OUTBOUND" | "SYSTEM";
  messageType: string;
  content: string;
  createdAt: string;
  metadata: ChatMessageMetadata | null;
};

export type DemoChatPageData = {
  isReadonlyFallback: boolean;
  conversationId: string;
  currentFlow: ChatFlow;
  currentStep: ChatStep;
  summary: string;
  customer: {
    name: string;
    phone: string;
    notes?: string | null;
  };
  restaurant: {
    name: string;
    phone: string;
    whatsappNumber?: string | null;
  };
  messages: DemoChatMessage[];
  activePrompt: ChatMessageMetadata["prompt"] | null;
};

export function createEmptyConversationContext(): ConversationContext {
  return {
    order: {
      cart: [],
    },
    tableBooking: {},
    birthdayParty: {},
    weddingEvent: {},
    menu: {},
  };
}
