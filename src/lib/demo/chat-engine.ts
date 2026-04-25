import { formatCurrency } from "@/lib/utils";

import {
  ChatFlow,
  ChatInput,
  ChatQuickReply,
  ChatRuntimeData,
  ChatStep,
  ChatTransition,
  ConversationContext,
  createEmptyConversationContext,
  type ChatCard,
  type ChatDraftMessage,
  type ChatEffectResult,
  type ChatRecordIntent,
  type OrderCartLine,
  type StoredConversationState,
} from "@/lib/demo/chat-types";

const dayFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

function option(
  key: string,
  label: string,
  description?: string,
  emphasis: ChatQuickReply["emphasis"] = "secondary",
): ChatQuickReply {
  return { key, label, description, emphasis };
}

function promptMessage(
  content: string,
  options: ChatQuickReply[],
  config?: {
    inputPlaceholder?: string;
    helpText?: string;
    presentation?: "chips" | "list";
    allowFreeText?: boolean;
  },
): ChatDraftMessage {
  return {
    content,
    direction: "OUTBOUND",
    messageType: "TEXT",
    metadata: {
      prompt: {
        options,
        inputPlaceholder: config?.inputPlaceholder,
        helpText: config?.helpText,
        presentation: config?.presentation ?? "chips",
        allowFreeText: config?.allowFreeText ?? true,
      },
    },
  };
}

function cardMessage(card: ChatCard): ChatDraftMessage {
  return {
    content: card.title,
    direction: "OUTBOUND",
    messageType: "CARD",
    metadata: {
      card,
    },
  };
}

function cloneContext(context: ConversationContext): ConversationContext {
  return structuredClone(context);
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function includesAny(value: string, words: string[]) {
  return words.some((word) => value.includes(word));
}

function extractNumber(value: string) {
  const matched = value.match(/\d+/);
  return matched ? Number(matched[0]) : null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatDateLabel(date: Date, prefix?: string) {
  return prefix ? `${prefix} · ${dayFormatter.format(date)}` : dayFormatter.format(date);
}

function buildDateOptions() {
  const today = new Date();

  return [
    option(`date:${today.toISOString().slice(0, 10)}`, formatDateLabel(today, "Today")),
    option(
      `date:${new Date(today.getTime() + 86400000).toISOString().slice(0, 10)}`,
      formatDateLabel(new Date(today.getTime() + 86400000), "Tomorrow"),
    ),
    option(
      `date:${new Date(today.getTime() + 2 * 86400000).toISOString().slice(0, 10)}`,
      formatDateLabel(new Date(today.getTime() + 2 * 86400000)),
    ),
    option(
      `date:${new Date(today.getTime() + 4 * 86400000).toISOString().slice(0, 10)}`,
      formatDateLabel(new Date(today.getTime() + 4 * 86400000)),
    ),
  ];
}

function buildTimeOptions() {
  return [
    option("time:12:30", "12:30 PM"),
    option("time:13:30", "1:30 PM"),
    option("time:19:30", "7:30 PM"),
    option("time:20:00", "8:00 PM"),
    option("time:20:30", "8:30 PM"),
    option("time:21:00", "9:00 PM"),
  ];
}

function buildSmallGuestOptions() {
  return [
    option("guests:2", "2 guests"),
    option("guests:4", "4 guests"),
    option("guests:6", "6 guests"),
    option("guests:8", "8 guests"),
    option("guests:10", "10 guests"),
  ];
}

function buildLargeGuestOptions() {
  return [
    option("guests:20", "20 guests"),
    option("guests:35", "35 guests"),
    option("guests:50", "50 guests"),
    option("guests:80", "80 guests"),
    option("guests:120", "120 guests"),
  ];
}

function buildBudgetOptions() {
  return [
    option("budget:INR 25k - 50k", "INR 25k - 50k"),
    option("budget:INR 50k - 1L", "INR 50k - 1L"),
    option("budget:INR 1L - 2L", "INR 1L - 2L"),
    option("budget:INR 2L - 4L", "INR 2L - 4L"),
    option("budget:Above INR 4L", "Above INR 4L"),
  ];
}

function buildWeddingBudgetOptions() {
  return [
    option("budget:INR 2L - 4L", "INR 2L - 4L"),
    option("budget:INR 4L - 6L", "INR 4L - 6L"),
    option("budget:INR 6L - 10L", "INR 6L - 10L"),
    option("budget:Above INR 10L", "Above INR 10L"),
  ];
}

function buildGuestCardSubtitle(count: number, noun: string) {
  return count === 1 ? `1 ${noun}` : `${count} ${noun}s`;
}

function buildWelcomeOptions() {
  return [
    option("flow:order", "Order Food", "Start a guided order", "primary"),
    option("flow:table", "Table Booking", "Reserve a table"),
    option("flow:party", "Birthday / Party Booking", "Celebrations & group dining"),
    option("flow:wedding", "Wedding / Event Booking", "Large-format event inquiry"),
    option("flow:menu", "Menu / Price List", "Browse featured dishes"),
    option("flow:contact", "Contact / Location / Timings", "Visit or call us"),
  ];
}

function buildMainMenuOption() {
  return option("global:main-menu", "Main Menu", "Back to the welcome flow");
}

function buildCategoryListCard(runtime: ChatRuntimeData) {
  return cardMessage({
    kind: "list",
    tone: "stone",
    title: "Mirch Masala categories",
    subtitle: "Choose where you would like to begin",
    items: runtime.categories.map((category) => ({
      title: category.name,
      description: category.description ?? "Chef-picked favourites",
    })),
  });
}

function buildCategoryOptions(runtime: ChatRuntimeData) {
  return runtime.categories.map((category) =>
    option(`category:${category.id}`, category.name, category.description ?? undefined),
  );
}

function buildItemOptions(runtime: ChatRuntimeData, categoryId: string) {
  return runtime.items
    .filter((item) => item.categoryId === categoryId)
    .slice(0, 8)
    .map((item) =>
      option(`item:${item.id}`, item.name, formatCurrency(item.priceInPaise, runtime.restaurant.currency)),
    );
}

function buildItemListCard(runtime: ChatRuntimeData, categoryId: string) {
  const category = runtime.categories.find((entry) => entry.id === categoryId);
  const items = runtime.items.filter((entry) => entry.categoryId === categoryId).slice(0, 8);

  return cardMessage({
    kind: "list",
    tone: "amber",
    title: category?.name ?? "Menu",
    subtitle: "WhatsApp-friendly shortlist",
    items: items.map((item) => ({
      title: item.name,
      description: item.description ?? "Signature Mirch Masala pick",
      meta: formatCurrency(item.priceInPaise, runtime.restaurant.currency),
      badge: item.isVegetarian ? "Veg" : "Chef special",
    })),
  });
}

function buildQuantityOptions() {
  return [
    option("quantity:1", "1"),
    option("quantity:2", "2"),
    option("quantity:3", "3"),
    option("quantity:4", "4"),
  ];
}

function buildOrderTypeOptions() {
  return [
    option("order-type:DELIVERY", "Delivery", "Send it to an address", "primary"),
    option("order-type:PICKUP", "Pickup", "Collect from the restaurant"),
    option("order-type:DINE_IN", "Dine-in", "Pre-order for a table"),
  ];
}

function buildCartSummaryCard(runtime: ChatRuntimeData, cart: OrderCartLine[]) {
  const subtotalInPaise = cart.reduce((sum, line) => sum + line.unitPriceInPaise * line.quantity, 0);

  return cardMessage({
    kind: "summary",
    tone: "amber",
    title: "Current cart",
    subtitle: buildGuestCardSubtitle(cart.length, "item"),
    items: cart.map((line) => ({
      title: `${line.itemName} x${line.quantity}`,
      description: line.categoryName,
      meta: formatCurrency(line.unitPriceInPaise * line.quantity, runtime.restaurant.currency),
    })),
    rows: [
      {
        label: "Subtotal",
        value: formatCurrency(subtotalInPaise, runtime.restaurant.currency),
      },
    ],
    footnote: "You can add more items or move to checkout.",
  });
}

function getOrderTotals(runtime: ChatRuntimeData, context: ConversationContext["order"]) {
  const subtotalInPaise = context.cart.reduce(
    (sum, line) => sum + line.unitPriceInPaise * line.quantity,
    0,
  );
  const deliveryFeeInPaise =
    context.orderType === "DELIVERY" ? runtime.deliveryFeeInPaise : 0;
  const taxInPaise = Math.round(subtotalInPaise * 0.05);
  const totalInPaise = subtotalInPaise + deliveryFeeInPaise + taxInPaise;

  return {
    subtotalInPaise,
    deliveryFeeInPaise,
    taxInPaise,
    totalInPaise,
  };
}

function buildOrderSummaryCard(runtime: ChatRuntimeData, context: ConversationContext["order"]) {
  const totals = getOrderTotals(runtime, context);
  const prepMinutes = Math.max(
    22,
    context.cart.reduce((sum, line) => sum + (line.prepTimeMinutes ?? 0), 0),
  );

  return cardMessage({
    kind: "summary",
    tone: "amber",
    title: "Order summary",
    subtitle: `${context.orderType ?? "Order"} · ETA ${prepMinutes + runtime.deliveryEtaMinutes} mins`,
    items: context.cart.map((line) => ({
      title: `${line.itemName} x${line.quantity}`,
      description: line.categoryName,
      meta: formatCurrency(line.unitPriceInPaise * line.quantity, runtime.restaurant.currency),
    })),
    rows: [
      {
        label: "Order type",
        value:
          context.orderType === "DINE_IN"
            ? "Dine-in pre-order"
            : context.orderType === "PICKUP"
              ? "Pickup"
              : "Delivery",
      },
      {
        label:
          context.orderType === "DELIVERY"
            ? "Address"
            : context.orderType === "DINE_IN"
              ? "Table note"
              : "Pickup note",
        value: context.addressOrNote ?? "No extra note",
      },
      {
        label: "Subtotal",
        value: formatCurrency(totals.subtotalInPaise, runtime.restaurant.currency),
      },
      {
        label: "Delivery fee",
        value: formatCurrency(totals.deliveryFeeInPaise, runtime.restaurant.currency),
      },
      {
        label: "Taxes",
        value: formatCurrency(totals.taxInPaise, runtime.restaurant.currency),
      },
      {
        label: "Total",
        value: formatCurrency(totals.totalInPaise, runtime.restaurant.currency),
      },
    ],
    footnote: "The next step will generate a demo payment request and leave it pending.",
  });
}

function buildHoursSummary(runtime: ChatRuntimeData) {
  return runtime.businessHours
    .filter((hour) => !hour.isClosed)
    .slice(0, 4)
    .map((hour) => {
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][hour.dayOfWeek] ?? "Day";
      return `${day}: ${hour.opensAt} - ${hour.closesAt}`;
    })
    .join(" • ");
}

function buildFeaturedMenuCard(runtime: ChatRuntimeData) {
  return cardMessage({
    kind: "list",
    tone: "amber",
    title: "Featured menu highlights",
    subtitle: "Premium picks that work beautifully in demos",
    items: runtime.items
      .filter((item) => item.isFeatured)
      .slice(0, 6)
      .map((item) => ({
        title: item.name,
        description: item.description ?? "House favourite",
        meta: formatCurrency(item.priceInPaise, runtime.restaurant.currency),
        badge: item.isVegetarian ? "Veg" : "Featured",
      })),
  });
}

function buildContactCard(runtime: ChatRuntimeData) {
  return cardMessage({
    kind: "contact",
    tone: "stone",
    title: "Visit Mirch Masala",
    subtitle: "Address, contact line, and opening hours",
    rows: [
      {
        label: "Address",
        value: `${runtime.restaurant.addressLine1}${runtime.restaurant.addressLine2 ? `, ${runtime.restaurant.addressLine2}` : ""}, ${runtime.restaurant.city}`,
      },
      {
        label: "Phone",
        value: runtime.restaurant.whatsappNumber ?? runtime.restaurant.phone,
      },
      {
        label: "Hours",
        value: buildHoursSummary(runtime),
      },
      {
        label: "Map preview",
        value: "Interactive map placeholder for the premium demo experience",
      },
    ],
    footnote: "Reply with Order Food or Table Booking any time to jump into a guided flow.",
  });
}

function buildWelcomeMessages() {
  return [
    promptMessage(
      "Welcome to Mirch Masala 🌶️\nPlease choose what you want to do",
      buildWelcomeOptions(),
      {
        inputPlaceholder: "Type order, booking, menu, or contact",
        helpText: "Everything here is a browser-based guided WhatsApp simulation.",
        presentation: "list",
      },
    ),
  ];
}

function buildOrderCategoryMessages(runtime: ChatRuntimeData, intro?: string) {
  return [
    buildCategoryListCard(runtime),
    promptMessage(
      intro ?? "Perfect. Which category would you like to order from first?",
      buildCategoryOptions(runtime),
      {
        inputPlaceholder: "Type a category name",
        helpText: "You can mix categories before checkout.",
        presentation: "list",
      },
    ),
  ];
}

function buildOrderItemMessages(
  runtime: ChatRuntimeData,
  context: ConversationContext["order"],
  intro?: string,
) {
  if (!context.selectedCategoryId) {
    return buildOrderCategoryMessages(runtime, "Let’s pick a category first.");
  }

  return [
    buildItemListCard(runtime, context.selectedCategoryId),
    promptMessage(
      intro ?? `Lovely choice. Which item from ${context.selectedCategoryName ?? "this category"} would you like to add?`,
      buildItemOptions(runtime, context.selectedCategoryId),
      {
        inputPlaceholder: "Type an item name",
        helpText: "Tap an item or type its name to continue.",
        presentation: "list",
      },
    ),
  ];
}

function buildOrderQuantityMessages(context: ConversationContext["order"], intro?: string) {
  return [
    promptMessage(
      intro ?? `How many portions of ${context.selectedItemName ?? "this item"} would you like?`,
      buildQuantityOptions(),
      {
        inputPlaceholder: "Enter a quantity",
        helpText: "You can type any number if you need more than 4.",
      },
    ),
  ];
}

function buildOrderNextActionMessages(
  runtime: ChatRuntimeData,
  context: ConversationContext["order"],
  intro?: string,
) {
  return [
    buildCartSummaryCard(runtime, context.cart),
    promptMessage(
      intro ?? "Your cart looks great. Would you like to add more items or move to checkout?",
      [
        option("order:add-more", "Add more items", "Keep building the order"),
        option("order:checkout", "Checkout", "Choose delivery, pickup, or dine-in", "primary"),
        buildMainMenuOption(),
      ],
      {
        inputPlaceholder: "Type add more or checkout",
      },
    ),
  ];
}

function buildOrderTypeMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "How would you like this order handled?",
      buildOrderTypeOptions(),
      {
        inputPlaceholder: "Type delivery, pickup, or dine-in",
      },
    ),
  ];
}

function buildOrderDetailsMessages(runtime: ChatRuntimeData, context: ConversationContext["order"], intro?: string) {
  const isDelivery = context.orderType === "DELIVERY";
  const isDineIn = context.orderType === "DINE_IN";

  const options = [
    isDelivery && runtime.customer.defaultAddress
      ? option(
          "order-detail:default-address",
          "Use saved address",
          runtime.customer.defaultAddress,
          "primary",
        )
      : null,
    option(
      "order-detail:no-note",
      isDelivery ? "No extra note" : "Skip note",
      isDelivery ? "I will use your typed address only" : "Continue without extra instructions",
    ),
    buildMainMenuOption(),
  ].filter((entry): entry is ChatQuickReply => Boolean(entry));

  return [
    promptMessage(
      intro ??
        (isDelivery
          ? "Please share the delivery address for this order."
          : isDineIn
            ? "Please add a table note or name for the dine-in booking."
            : "Please share a pickup note or collection name."),
      options,
      {
        inputPlaceholder: isDelivery ? "Enter delivery address" : "Add an optional note",
        helpText: isDelivery
          ? "A saved customer address can be inserted instantly."
          : "This note will appear in the order summary card.",
      },
    ),
  ];
}

function buildOrderSummaryMessages(runtime: ChatRuntimeData, context: ConversationContext["order"], intro?: string) {
  return [
    buildOrderSummaryCard(runtime, context),
    promptMessage(
      intro ?? "Everything is ready. Would you like me to generate the payment request now?",
      [
        option("order:request-payment", "Request payment", "Create a pending payment state", "primary"),
        option("order:add-more", "Add more items", "Go back and continue shopping"),
        buildMainMenuOption(),
      ],
      {
        inputPlaceholder: "Type request payment or add more",
      },
    ),
  ];
}

function buildTableBookingDateMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "Sure. Which date should I hold for your table request?",
      buildDateOptions(),
      {
        inputPlaceholder: "Enter a date",
      },
    ),
  ];
}

function buildTableBookingTimeMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "What time would you prefer?",
      buildTimeOptions(),
      {
        inputPlaceholder: "Enter a preferred time",
      },
    ),
  ];
}

function buildTableBookingGuestMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "How many guests should I note for the table?",
      buildSmallGuestOptions(),
      {
        inputPlaceholder: "Enter guest count",
      },
    ),
  ];
}

function buildTableBookingSeatingMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "Would you prefer indoor or outdoor seating?",
      [
        option("seating:Indoor", "Indoor", "Elegant main dining", "primary"),
        option("seating:Outdoor", "Outdoor", "Courtyard seating"),
        buildMainMenuOption(),
      ],
      {
        inputPlaceholder: "Type indoor or outdoor",
      },
    ),
  ];
}

function buildTableBookingSpecialRequestMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "Any special request I should add for the booking?",
      [
        option("booking-request:none", "No special request", "Continue to the summary"),
        buildMainMenuOption(),
      ],
      {
        inputPlaceholder: "Add a special request",
        helpText: "Examples: quiet corner, birthday dessert, high chair.",
      },
    ),
  ];
}

function buildTableBookingSummaryMessages(context: ConversationContext["tableBooking"], intro?: string) {
  return [
    cardMessage({
      kind: "summary",
      tone: "amber",
      title: "Table booking summary",
      subtitle: `${context.guestCount ?? 0} guests`,
      rows: [
        { label: "Date", value: context.dateLabel ?? "TBD" },
        { label: "Time", value: context.timeLabel ?? "TBD" },
        { label: "Guests", value: `${context.guestCount ?? 0}` },
        { label: "Preference", value: context.seatingPreference ?? "No preference" },
        { label: "Special request", value: context.specialRequest ?? "None" },
      ],
      footnote: "Submitting this creates a pending approval state for the host team.",
    }),
    promptMessage(
      intro ?? "This looks good. Would you like me to submit the booking request?",
      [
        option("booking:submit", "Submit booking", "Send for manager approval", "primary"),
        buildMainMenuOption(),
      ],
      {
        inputPlaceholder: "Type submit booking",
      },
    ),
  ];
}

function buildPartyDateMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "Wonderful. Which date are you planning the birthday or party booking for?",
      buildDateOptions(),
      {
        inputPlaceholder: "Enter the event date",
      },
    ),
  ];
}

function buildPartyGuestMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "How many guests should I expect for the celebration?",
      buildLargeGuestOptions(),
      {
        inputPlaceholder: "Enter guest count",
      },
    ),
  ];
}

function buildPartyBudgetMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "What budget range should I note for the party inquiry?",
      buildBudgetOptions(),
      {
        inputPlaceholder: "Enter a budget range",
      },
    ),
  ];
}

function buildPartyFoodMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "What kind of food preference should I capture?",
      [
        option("food:Vegetarian", "Vegetarian", "Curated vegetarian menu"),
        option("food:Non-vegetarian", "Non-vegetarian", "Chicken, kebabs, and grills"),
        option("food:Mixed menu", "Mixed menu", "Balanced veg and non-veg", "primary"),
        option("food:Jain-friendly", "Jain-friendly", "Special dietary setup"),
      ],
      {
        inputPlaceholder: "Type a food preference",
      },
    ),
  ];
}

function buildPartyDecorationMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "Would you like us to note decoration requirements too?",
      [
        option("decor:yes", "Yes, decoration required", "Balloon, cake table, florals", "primary"),
        option("decor:no", "No decoration", "Food and seating only"),
        buildMainMenuOption(),
      ],
      {
        inputPlaceholder: "Type yes or no",
      },
    ),
  ];
}

function buildPartySummaryMessages(context: ConversationContext["birthdayParty"], intro?: string) {
  return [
    cardMessage({
      kind: "summary",
      tone: "amber",
      title: "Birthday / party inquiry",
      subtitle: `${context.guestCount ?? 0} guests`,
      rows: [
        { label: "Date", value: context.dateLabel ?? "TBD" },
        { label: "Guests", value: `${context.guestCount ?? 0}` },
        { label: "Budget", value: context.budgetRange ?? "TBD" },
        { label: "Food preference", value: context.foodPreference ?? "TBD" },
        {
          label: "Decoration",
          value: context.decorationRequired ? "Required" : "Not required",
        },
      ],
      footnote: "Submitting this sends the inquiry to the celebrations team for a callback.",
    }),
    promptMessage(
      intro ?? "Shall I submit this celebration inquiry?",
      [
        option("party:submit", "Submit inquiry", "Request a callback", "primary"),
        buildMainMenuOption(),
      ],
      {
        inputPlaceholder: "Type submit inquiry",
      },
    ),
  ];
}

function buildWeddingTypeMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "What type of wedding or event should I note?",
      [
        option("event-type:Wedding Reception", "Wedding Reception", "Signature dinner service"),
        option("event-type:Mehendi / Haldi", "Mehendi / Haldi", "Daytime celebration"),
        option("event-type:Engagement", "Engagement", "Elegant family gathering"),
        option("event-type:Corporate Event", "Corporate Event", "Brand dinner or launch"),
        option("event-type:Custom Event", "Custom Event", "Something bespoke", "primary"),
      ],
      {
        inputPlaceholder: "Type an event type",
      },
    ),
  ];
}

function buildWeddingDateMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "What date should I mark for the event inquiry?",
      buildDateOptions(),
      {
        inputPlaceholder: "Enter the event date",
      },
    ),
  ];
}

function buildWeddingGuestMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "How many guests are you planning for?",
      [
        option("guests:60", "60 guests"),
        option("guests:100", "100 guests"),
        option("guests:150", "150 guests", undefined, "primary"),
        option("guests:220", "220 guests"),
      ],
      {
        inputPlaceholder: "Enter guest count",
      },
    ),
  ];
}

function buildWeddingBudgetMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "What budget range should I share with our event team?",
      buildWeddingBudgetOptions(),
      {
        inputPlaceholder: "Enter a budget range",
      },
    ),
  ];
}

function buildWeddingNotesMessages(intro?: string) {
  return [
    promptMessage(
      intro ?? "Please add any notes that will help us prepare the proposal.",
      [
        option("wedding-note:none", "No extra notes", "Skip straight to the summary"),
        buildMainMenuOption(),
      ],
      {
        inputPlaceholder: "Add event notes",
        helpText: "Examples: stage setup, family style service, pre-function cocktails.",
      },
    ),
  ];
}

function buildWeddingSummaryMessages(context: ConversationContext["weddingEvent"], intro?: string) {
  return [
    cardMessage({
      kind: "summary",
      tone: "amber",
      title: "Wedding / event inquiry",
      subtitle: `${context.eventType ?? "Event"} · ${context.guestCount ?? 0} guests`,
      rows: [
        { label: "Event type", value: context.eventType ?? "TBD" },
        { label: "Date", value: context.dateLabel ?? "TBD" },
        { label: "Guests", value: `${context.guestCount ?? 0}` },
        { label: "Budget", value: context.budgetRange ?? "TBD" },
        { label: "Notes", value: context.notes ?? "None" },
      ],
      footnote: "Submitting this sends a premium event brief to the restaurant team.",
    }),
    promptMessage(
      intro ?? "Everything is captured. Would you like me to submit the event inquiry?",
      [
        option("wedding:submit", "Submit inquiry", "Send to the events team", "primary"),
        buildMainMenuOption(),
      ],
      {
        inputPlaceholder: "Type submit inquiry",
      },
    ),
  ];
}

function buildMenuCategoryMessages(runtime: ChatRuntimeData, intro?: string) {
  return [
    buildFeaturedMenuCard(runtime),
    promptMessage(
      intro ?? "Which category would you like to browse in more detail?",
      [
        ...buildCategoryOptions(runtime),
        option("menu:start-order", "Start order flow", "Jump straight into guided ordering", "primary"),
        buildMainMenuOption(),
      ],
      {
        inputPlaceholder: "Type a category or start order",
        presentation: "list",
      },
    ),
  ];
}

function buildMenuBrowsingMessages(
  runtime: ChatRuntimeData,
  context: ConversationContext["menu"],
  intro?: string,
) {
  if (!context.selectedCategoryId) {
    return buildMenuCategoryMessages(runtime, "Let’s browse the menu first.");
  }

  return [
    buildItemListCard(runtime, context.selectedCategoryId),
    promptMessage(
      intro ?? `Here are some favourites from ${context.selectedCategoryName ?? "this category"}.`,
      [
        option("menu:browse-more", "Browse another category", "See a different part of the menu"),
        option("menu:start-order", "Start order", "Turn this into a guided order", "primary"),
        buildMainMenuOption(),
      ],
      {
        inputPlaceholder: "Type browse another or start order",
      },
    ),
  ];
}

function buildContactMessages(runtime: ChatRuntimeData, intro?: string) {
  return [
    buildContactCard(runtime),
    promptMessage(
      intro ?? "I can also take you straight into an order or booking flow from here.",
      [
        option("flow:order", "Order Food", "Open ordering flow", "primary"),
        option("flow:table", "Table Booking", "Reserve a table"),
        buildMainMenuOption(),
      ],
      {
        inputPlaceholder: "Type order or booking",
      },
    ),
  ];
}

function buildRetry(messages: ChatDraftMessage[], prefix: string) {
  return [
    {
      content: prefix,
      direction: "OUTBOUND" as const,
      messageType: "TEXT" as const,
    },
    ...messages,
  ];
}

function findCategory(runtime: ChatRuntimeData, input: ChatInput) {
  if (input.quickReplyKey?.startsWith("category:")) {
    const categoryId = input.quickReplyKey.slice("category:".length);
    return runtime.categories.find((entry) => entry.id === categoryId) ?? null;
  }

  const normalizedInput = normalize(input.value);
  return (
    runtime.categories.find((entry) => normalize(entry.name) === normalizedInput) ??
    runtime.categories.find((entry) => normalize(entry.name).includes(normalizedInput))
  );
}

function findItem(runtime: ChatRuntimeData, categoryId: string, input: ChatInput) {
  const items = runtime.items.filter((entry) => entry.categoryId === categoryId);

  if (input.quickReplyKey?.startsWith("item:")) {
    const itemId = input.quickReplyKey.slice("item:".length);
    return items.find((entry) => entry.id === itemId) ?? null;
  }

  const normalizedInput = normalize(input.value);
  return (
    items.find((entry) => normalize(entry.name) === normalizedInput) ??
    items.find((entry) => normalize(entry.name).includes(normalizedInput))
  );
}

function isMainMenu(input: ChatInput) {
  return (
    input.quickReplyKey === "global:main-menu" ||
    includesAny(normalize(input.value), ["main menu", "start over", "home"])
  );
}

function matchesSubmit(input: ChatInput, key: string, extraMatches: string[]) {
  return input.quickReplyKey === key || includesAny(normalize(input.value), extraMatches);
}

function startFlow(flow: typeof ChatFlow[keyof typeof ChatFlow], runtime: ChatRuntimeData): ChatTransition {
  const context = createEmptyConversationContext();

  switch (flow) {
    case ChatFlow.ORDER_FOOD:
      return {
        nextFlow: ChatFlow.ORDER_FOOD,
        nextStep: ChatStep.ORDER_CATEGORY,
        nextContext: context,
        summary: "Guided food order in progress.",
        outbound: buildOrderCategoryMessages(runtime),
      };
    case ChatFlow.TABLE_BOOKING:
      return {
        nextFlow: ChatFlow.TABLE_BOOKING,
        nextStep: ChatStep.BOOKING_DATE,
        nextContext: context,
        summary: "Table booking flow in progress.",
        outbound: buildTableBookingDateMessages(),
      };
    case ChatFlow.BIRTHDAY_PARTY:
      return {
        nextFlow: ChatFlow.BIRTHDAY_PARTY,
        nextStep: ChatStep.PARTY_DATE,
        nextContext: context,
        summary: "Birthday or party inquiry in progress.",
        outbound: buildPartyDateMessages(),
      };
    case ChatFlow.WEDDING_EVENT:
      return {
        nextFlow: ChatFlow.WEDDING_EVENT,
        nextStep: ChatStep.WEDDING_EVENT_TYPE,
        nextContext: context,
        summary: "Wedding or event inquiry in progress.",
        outbound: buildWeddingTypeMessages(),
      };
    case ChatFlow.MENU_PRICE_LIST:
      return {
        nextFlow: ChatFlow.MENU_PRICE_LIST,
        nextStep: ChatStep.MENU_CATEGORY,
        nextContext: context,
        summary: "Menu browsing in progress.",
        outbound: buildMenuCategoryMessages(runtime),
      };
    case ChatFlow.CONTACT_INFO:
      return {
        nextFlow: ChatFlow.CONTACT_INFO,
        nextStep: ChatStep.CONTACT_DETAILS,
        nextContext: context,
        summary: "Contact details shared in chat.",
        outbound: buildContactMessages(runtime),
      };
    default:
      return createInitialConversationTransition();
  }
}

export function createInitialConversationTransition(): ChatTransition {
  return {
    nextFlow: ChatFlow.WELCOME,
    nextStep: ChatStep.WELCOME_ROOT,
    nextContext: createEmptyConversationContext(),
    summary: "Guided WhatsApp concierge ready.",
    outbound: buildWelcomeMessages(),
  };
}

function handleWelcome(input: ChatInput, runtime: ChatRuntimeData): ChatTransition {
  const normalizedInput = normalize(input.value);

  if (input.quickReplyKey === "flow:order" || includesAny(normalizedInput, ["order", "food", "delivery", "pickup"])) {
    return startFlow(ChatFlow.ORDER_FOOD, runtime);
  }

  if (input.quickReplyKey === "flow:table" || includesAny(normalizedInput, ["table", "booking", "reserve"])) {
    return startFlow(ChatFlow.TABLE_BOOKING, runtime);
  }

  if (input.quickReplyKey === "flow:party" || includesAny(normalizedInput, ["birthday", "party", "celebration"])) {
    return startFlow(ChatFlow.BIRTHDAY_PARTY, runtime);
  }

  if (input.quickReplyKey === "flow:wedding" || includesAny(normalizedInput, ["wedding", "event", "corporate"])) {
    return startFlow(ChatFlow.WEDDING_EVENT, runtime);
  }

  if (input.quickReplyKey === "flow:menu" || includesAny(normalizedInput, ["menu", "price", "dish"])) {
    return startFlow(ChatFlow.MENU_PRICE_LIST, runtime);
  }

  if (input.quickReplyKey === "flow:contact" || includesAny(normalizedInput, ["contact", "location", "timing", "hours"])) {
    return startFlow(ChatFlow.CONTACT_INFO, runtime);
  }

  return {
    ...createInitialConversationTransition(),
    outbound: buildRetry(
      buildWelcomeMessages(),
      "I can help with orders, bookings, menu browsing, or contact details. Please choose one option below.",
    ),
  };
}

function handleOrderFlow(
  state: StoredConversationState,
  input: ChatInput,
  runtime: ChatRuntimeData,
): ChatTransition {
  const context = cloneContext(state.context);
  const order = context.order;

  switch (state.currentStep) {
    case ChatStep.ORDER_CATEGORY: {
      const category = findCategory(runtime, input);
      if (!category) {
        return {
          nextFlow: ChatFlow.ORDER_FOOD,
          nextStep: ChatStep.ORDER_CATEGORY,
          nextContext: context,
          summary: "Guided food order in progress.",
          outbound: buildRetry(
            buildOrderCategoryMessages(runtime),
            "I didn’t catch that category. Please choose one of the menu sections below.",
          ),
        };
      }

      order.selectedCategoryId = category.id;
      order.selectedCategoryName = category.name;

      return {
        nextFlow: ChatFlow.ORDER_FOOD,
        nextStep: ChatStep.ORDER_ITEM,
        nextContext: context,
        summary: "Guided food order in progress.",
        outbound: buildOrderItemMessages(runtime, order),
      };
    }

    case ChatStep.ORDER_ITEM: {
      const categoryId = order.selectedCategoryId;
      if (!categoryId) {
        return {
          nextFlow: ChatFlow.ORDER_FOOD,
          nextStep: ChatStep.ORDER_CATEGORY,
          nextContext: context,
          summary: "Guided food order in progress.",
          outbound: buildOrderCategoryMessages(runtime, "Let’s choose a category first."),
        };
      }

      const item = findItem(runtime, categoryId, input);
      if (!item) {
        return {
          nextFlow: ChatFlow.ORDER_FOOD,
          nextStep: ChatStep.ORDER_ITEM,
          nextContext: context,
          summary: "Guided food order in progress.",
          outbound: buildRetry(
            buildOrderItemMessages(runtime, order),
            "I couldn’t match that item. Please choose one from the shortlist below.",
          ),
        };
      }

      order.selectedItemId = item.id;
      order.selectedItemName = item.name;
      order.selectedItemPriceInPaise = item.priceInPaise;
      order.selectedItemPrepTimeMinutes = item.prepTimeMinutes;

      return {
        nextFlow: ChatFlow.ORDER_FOOD,
        nextStep: ChatStep.ORDER_QUANTITY,
        nextContext: context,
        summary: "Guided food order in progress.",
        outbound: buildOrderQuantityMessages(order),
      };
    }

    case ChatStep.ORDER_QUANTITY: {
      const quantity =
        input.quickReplyKey?.startsWith("quantity:")
          ? Number(input.quickReplyKey.slice("quantity:".length))
          : extractNumber(input.value);

      if (!quantity || quantity < 1) {
        return {
          nextFlow: ChatFlow.ORDER_FOOD,
          nextStep: ChatStep.ORDER_QUANTITY,
          nextContext: context,
          summary: "Guided food order in progress.",
          outbound: buildRetry(
            buildOrderQuantityMessages(order),
            "Please share a valid quantity so I can add it to your cart.",
          ),
        };
      }

      order.cart.push({
        itemId: order.selectedItemId ?? `manual-${Date.now()}`,
        itemName: order.selectedItemName ?? "Selected dish",
        categoryName: order.selectedCategoryName ?? "Mirch Masala",
        quantity,
        unitPriceInPaise: order.selectedItemPriceInPaise ?? 0,
        prepTimeMinutes: order.selectedItemPrepTimeMinutes ?? undefined,
      });

      order.selectedItemId = undefined;
      order.selectedItemName = undefined;
      order.selectedItemPriceInPaise = undefined;
      order.selectedItemPrepTimeMinutes = undefined;

      return {
        nextFlow: ChatFlow.ORDER_FOOD,
        nextStep: ChatStep.ORDER_NEXT_ACTION,
        nextContext: context,
        summary: "Guided food order in progress.",
        outbound: buildOrderNextActionMessages(runtime, order),
      };
    }

    case ChatStep.ORDER_NEXT_ACTION: {
      if (matchesSubmit(input, "order:add-more", ["add more", "another", "continue"])) {
        order.selectedCategoryId = undefined;
        order.selectedCategoryName = undefined;

        return {
          nextFlow: ChatFlow.ORDER_FOOD,
          nextStep: ChatStep.ORDER_CATEGORY,
          nextContext: context,
          summary: "Guided food order in progress.",
          outbound: buildOrderCategoryMessages(runtime, "Absolutely. Which category would you like to add next?"),
        };
      }

      if (matchesSubmit(input, "order:checkout", ["checkout", "check out", "done"])) {
        return {
          nextFlow: ChatFlow.ORDER_FOOD,
          nextStep: ChatStep.ORDER_TYPE,
          nextContext: context,
          summary: "Guided food order in progress.",
          outbound: buildOrderTypeMessages(),
        };
      }

      return {
        nextFlow: ChatFlow.ORDER_FOOD,
        nextStep: ChatStep.ORDER_NEXT_ACTION,
        nextContext: context,
        summary: "Guided food order in progress.",
        outbound: buildRetry(
          buildOrderNextActionMessages(runtime, order),
          "Please choose whether to add more items or head to checkout.",
        ),
      };
    }

    case ChatStep.ORDER_TYPE: {
      const normalizedInput = normalize(input.value);

      if (input.quickReplyKey === "order-type:DELIVERY" || includesAny(normalizedInput, ["delivery"])) {
        order.orderType = "DELIVERY";
      } else if (input.quickReplyKey === "order-type:PICKUP" || includesAny(normalizedInput, ["pickup", "pick up"])) {
        order.orderType = "PICKUP";
      } else if (input.quickReplyKey === "order-type:DINE_IN" || includesAny(normalizedInput, ["dine", "table"])) {
        order.orderType = "DINE_IN";
      }

      if (!order.orderType) {
        return {
          nextFlow: ChatFlow.ORDER_FOOD,
          nextStep: ChatStep.ORDER_TYPE,
          nextContext: context,
          summary: "Guided food order in progress.",
          outbound: buildRetry(
            buildOrderTypeMessages(),
            "Please choose delivery, pickup, or dine-in so I can continue.",
          ),
        };
      }

      return {
        nextFlow: ChatFlow.ORDER_FOOD,
        nextStep: ChatStep.ORDER_DETAILS,
        nextContext: context,
        summary: "Guided food order in progress.",
        outbound: buildOrderDetailsMessages(runtime, order),
      };
    }

    case ChatStep.ORDER_DETAILS: {
      if (input.quickReplyKey === "order-detail:default-address" && runtime.customer.defaultAddress) {
        order.addressOrNote = runtime.customer.defaultAddress;
      } else if (input.quickReplyKey === "order-detail:no-note") {
        order.addressOrNote =
          order.orderType === "DELIVERY" ? runtime.customer.defaultAddress ?? "Address shared in chat" : "No extra note";
      } else if (input.value.trim()) {
        order.addressOrNote = input.value.trim();
      }

      if (!order.addressOrNote) {
        return {
          nextFlow: ChatFlow.ORDER_FOOD,
          nextStep: ChatStep.ORDER_DETAILS,
          nextContext: context,
          summary: "Guided food order in progress.",
          outbound: buildRetry(
            buildOrderDetailsMessages(runtime, order),
            "I still need the address or note before I can prepare the order summary.",
          ),
        };
      }

      return {
        nextFlow: ChatFlow.ORDER_FOOD,
        nextStep: ChatStep.ORDER_SUMMARY,
        nextContext: context,
        summary: "Order summary ready for payment request.",
        outbound: buildOrderSummaryMessages(runtime, order),
      };
    }

    case ChatStep.ORDER_SUMMARY: {
      if (matchesSubmit(input, "order:add-more", ["add more", "another"])) {
        return {
          nextFlow: ChatFlow.ORDER_FOOD,
          nextStep: ChatStep.ORDER_CATEGORY,
          nextContext: context,
          summary: "Guided food order in progress.",
          outbound: buildOrderCategoryMessages(runtime, "No problem. Let’s add more items before payment."),
        };
      }

      if (matchesSubmit(input, "order:request-payment", ["request payment", "pay", "continue"])) {
        return {
          nextFlow: ChatFlow.ORDER_FOOD,
          nextStep: ChatStep.ORDER_PAYMENT_PENDING,
          nextContext: context,
          summary: "Payment request pending for guided order.",
          outbound: [],
          intent: { type: "CREATE_ORDER_PENDING" },
        };
      }

      return {
        nextFlow: ChatFlow.ORDER_FOOD,
        nextStep: ChatStep.ORDER_SUMMARY,
        nextContext: context,
        summary: "Order summary ready for payment request.",
        outbound: buildRetry(
          buildOrderSummaryMessages(runtime, order),
          "Please choose whether to request payment or add more items.",
        ),
      };
    }

    case ChatStep.ORDER_PAYMENT_PENDING:
      return createInitialConversationTransition();

    default:
      return startFlow(ChatFlow.ORDER_FOOD, runtime);
  }
}

function handleTableBookingFlow(
  state: StoredConversationState,
  input: ChatInput,
): ChatTransition {
  const context = cloneContext(state.context);
  const booking = context.tableBooking;

  switch (state.currentStep) {
    case ChatStep.BOOKING_DATE:
      booking.dateValue = input.quickReplyKey?.startsWith("date:")
        ? input.quickReplyKey.slice("date:".length)
        : undefined;
      booking.dateLabel = input.value.trim() || booking.dateValue;
      if (!booking.dateLabel) {
        return {
          nextFlow: ChatFlow.TABLE_BOOKING,
          nextStep: ChatStep.BOOKING_DATE,
          nextContext: context,
          summary: "Table booking flow in progress.",
          outbound: buildRetry(
            buildTableBookingDateMessages(),
            "Please share the preferred booking date.",
          ),
        };
      }
      return {
        nextFlow: ChatFlow.TABLE_BOOKING,
        nextStep: ChatStep.BOOKING_TIME,
        nextContext: context,
        summary: "Table booking flow in progress.",
        outbound: buildTableBookingTimeMessages(),
      };

    case ChatStep.BOOKING_TIME:
      booking.timeLabel = input.value.trim()
        || (input.quickReplyKey?.startsWith("time:")
          ? input.quickReplyKey.slice("time:".length).replace(/^(\d{2}):(\d{2})$/, "$1:$2")
          : "");
      if (!booking.timeLabel) {
        return {
          nextFlow: ChatFlow.TABLE_BOOKING,
          nextStep: ChatStep.BOOKING_TIME,
          nextContext: context,
          summary: "Table booking flow in progress.",
          outbound: buildRetry(buildTableBookingTimeMessages(), "Please share the preferred time."),
        };
      }
      return {
        nextFlow: ChatFlow.TABLE_BOOKING,
        nextStep: ChatStep.BOOKING_GUEST_COUNT,
        nextContext: context,
        summary: "Table booking flow in progress.",
        outbound: buildTableBookingGuestMessages(),
      };

    case ChatStep.BOOKING_GUEST_COUNT:
      booking.guestCount =
        input.quickReplyKey?.startsWith("guests:")
          ? Number(input.quickReplyKey.slice("guests:".length))
          : extractNumber(input.value) ?? undefined;
      if (!booking.guestCount || booking.guestCount < 1) {
        return {
          nextFlow: ChatFlow.TABLE_BOOKING,
          nextStep: ChatStep.BOOKING_GUEST_COUNT,
          nextContext: context,
          summary: "Table booking flow in progress.",
          outbound: buildRetry(
            buildTableBookingGuestMessages(),
            "Please share the guest count for the booking.",
          ),
        };
      }
      return {
        nextFlow: ChatFlow.TABLE_BOOKING,
        nextStep: ChatStep.BOOKING_SEATING,
        nextContext: context,
        summary: "Table booking flow in progress.",
        outbound: buildTableBookingSeatingMessages(),
      };

    case ChatStep.BOOKING_SEATING:
      booking.seatingPreference = input.quickReplyKey?.startsWith("seating:")
        ? input.quickReplyKey.slice("seating:".length)
        : input.value.trim();
      if (!booking.seatingPreference) {
        return {
          nextFlow: ChatFlow.TABLE_BOOKING,
          nextStep: ChatStep.BOOKING_SEATING,
          nextContext: context,
          summary: "Table booking flow in progress.",
          outbound: buildRetry(
            buildTableBookingSeatingMessages(),
            "Please choose indoor or outdoor seating.",
          ),
        };
      }
      return {
        nextFlow: ChatFlow.TABLE_BOOKING,
        nextStep: ChatStep.BOOKING_SPECIAL_REQUEST,
        nextContext: context,
        summary: "Table booking flow in progress.",
        outbound: buildTableBookingSpecialRequestMessages(),
      };

    case ChatStep.BOOKING_SPECIAL_REQUEST:
      booking.specialRequest =
        input.quickReplyKey === "booking-request:none" ? "No special request" : input.value.trim();
      if (!booking.specialRequest) {
        return {
          nextFlow: ChatFlow.TABLE_BOOKING,
          nextStep: ChatStep.BOOKING_SPECIAL_REQUEST,
          nextContext: context,
          summary: "Table booking flow in progress.",
          outbound: buildRetry(
            buildTableBookingSpecialRequestMessages(),
            "Please add a request or choose No special request.",
          ),
        };
      }
      return {
        nextFlow: ChatFlow.TABLE_BOOKING,
        nextStep: ChatStep.BOOKING_SUMMARY,
        nextContext: context,
        summary: "Table booking summary ready.",
        outbound: buildTableBookingSummaryMessages(booking),
      };

    case ChatStep.BOOKING_SUMMARY:
      if (matchesSubmit(input, "booking:submit", ["submit", "confirm"])) {
        return {
          nextFlow: ChatFlow.TABLE_BOOKING,
          nextStep: ChatStep.BOOKING_PENDING_APPROVAL,
          nextContext: context,
          summary: "Table booking pending approval.",
          outbound: [],
          intent: { type: "CREATE_TABLE_BOOKING" },
        };
      }
      return {
        nextFlow: ChatFlow.TABLE_BOOKING,
        nextStep: ChatStep.BOOKING_SUMMARY,
        nextContext: context,
        summary: "Table booking summary ready.",
        outbound: buildRetry(
          buildTableBookingSummaryMessages(booking),
          "Please submit the booking when you are happy with the summary.",
        ),
      };

    case ChatStep.BOOKING_PENDING_APPROVAL:
      return createInitialConversationTransition();

    default:
      return {
        nextFlow: ChatFlow.TABLE_BOOKING,
        nextStep: ChatStep.BOOKING_DATE,
        nextContext: createEmptyConversationContext(),
        summary: "Table booking flow in progress.",
        outbound: buildTableBookingDateMessages(),
      };
  }
}

function handlePartyFlow(state: StoredConversationState, input: ChatInput): ChatTransition {
  const context = cloneContext(state.context);
  const party = context.birthdayParty;

  switch (state.currentStep) {
    case ChatStep.PARTY_DATE:
      party.dateValue = input.quickReplyKey?.startsWith("date:")
        ? input.quickReplyKey.slice("date:".length)
        : undefined;
      party.dateLabel = input.value.trim() || party.dateValue;
      if (!party.dateLabel) {
        return {
          nextFlow: ChatFlow.BIRTHDAY_PARTY,
          nextStep: ChatStep.PARTY_DATE,
          nextContext: context,
          summary: "Birthday or party inquiry in progress.",
          outbound: buildRetry(buildPartyDateMessages(), "Please share the event date."),
        };
      }
      return {
        nextFlow: ChatFlow.BIRTHDAY_PARTY,
        nextStep: ChatStep.PARTY_GUEST_COUNT,
        nextContext: context,
        summary: "Birthday or party inquiry in progress.",
        outbound: buildPartyGuestMessages(),
      };

    case ChatStep.PARTY_GUEST_COUNT:
      party.guestCount =
        input.quickReplyKey?.startsWith("guests:")
          ? Number(input.quickReplyKey.slice("guests:".length))
          : extractNumber(input.value) ?? undefined;
      if (!party.guestCount || party.guestCount < 1) {
        return {
          nextFlow: ChatFlow.BIRTHDAY_PARTY,
          nextStep: ChatStep.PARTY_GUEST_COUNT,
          nextContext: context,
          summary: "Birthday or party inquiry in progress.",
          outbound: buildRetry(buildPartyGuestMessages(), "Please share the expected guest count."),
        };
      }
      return {
        nextFlow: ChatFlow.BIRTHDAY_PARTY,
        nextStep: ChatStep.PARTY_BUDGET,
        nextContext: context,
        summary: "Birthday or party inquiry in progress.",
        outbound: buildPartyBudgetMessages(),
      };

    case ChatStep.PARTY_BUDGET:
      party.budgetRange = input.quickReplyKey?.startsWith("budget:")
        ? input.quickReplyKey.slice("budget:".length)
        : input.value.trim();
      if (!party.budgetRange) {
        return {
          nextFlow: ChatFlow.BIRTHDAY_PARTY,
          nextStep: ChatStep.PARTY_BUDGET,
          nextContext: context,
          summary: "Birthday or party inquiry in progress.",
          outbound: buildRetry(buildPartyBudgetMessages(), "Please choose a budget range."),
        };
      }
      return {
        nextFlow: ChatFlow.BIRTHDAY_PARTY,
        nextStep: ChatStep.PARTY_FOOD_PREFERENCE,
        nextContext: context,
        summary: "Birthday or party inquiry in progress.",
        outbound: buildPartyFoodMessages(),
      };

    case ChatStep.PARTY_FOOD_PREFERENCE:
      party.foodPreference = input.quickReplyKey?.startsWith("food:")
        ? input.quickReplyKey.slice("food:".length)
        : input.value.trim();
      if (!party.foodPreference) {
        return {
          nextFlow: ChatFlow.BIRTHDAY_PARTY,
          nextStep: ChatStep.PARTY_FOOD_PREFERENCE,
          nextContext: context,
          summary: "Birthday or party inquiry in progress.",
          outbound: buildRetry(buildPartyFoodMessages(), "Please choose a food preference."),
        };
      }
      return {
        nextFlow: ChatFlow.BIRTHDAY_PARTY,
        nextStep: ChatStep.PARTY_DECORATION,
        nextContext: context,
        summary: "Birthday or party inquiry in progress.",
        outbound: buildPartyDecorationMessages(),
      };

    case ChatStep.PARTY_DECORATION:
      if (input.quickReplyKey === "decor:yes" || includesAny(normalize(input.value), ["yes", "decor"])) {
        party.decorationRequired = true;
      } else if (input.quickReplyKey === "decor:no" || includesAny(normalize(input.value), ["no"])) {
        party.decorationRequired = false;
      }

      if (party.decorationRequired === undefined) {
        return {
          nextFlow: ChatFlow.BIRTHDAY_PARTY,
          nextStep: ChatStep.PARTY_DECORATION,
          nextContext: context,
          summary: "Birthday or party inquiry in progress.",
          outbound: buildRetry(buildPartyDecorationMessages(), "Please let me know whether decoration is required."),
        };
      }

      return {
        nextFlow: ChatFlow.BIRTHDAY_PARTY,
        nextStep: ChatStep.PARTY_SUMMARY,
        nextContext: context,
        summary: "Birthday or party inquiry summary ready.",
        outbound: buildPartySummaryMessages(party),
      };

    case ChatStep.PARTY_SUMMARY:
      if (matchesSubmit(input, "party:submit", ["submit", "confirm"])) {
        return {
          nextFlow: ChatFlow.BIRTHDAY_PARTY,
          nextStep: ChatStep.PARTY_CALLBACK_CONFIRMED,
          nextContext: context,
          summary: "Birthday or party callback scheduled.",
          outbound: [],
          intent: { type: "CREATE_PARTY_INQUIRY" },
        };
      }
      return {
        nextFlow: ChatFlow.BIRTHDAY_PARTY,
        nextStep: ChatStep.PARTY_SUMMARY,
        nextContext: context,
        summary: "Birthday or party inquiry summary ready.",
        outbound: buildRetry(buildPartySummaryMessages(party), "Please submit the inquiry when you are ready."),
      };

    case ChatStep.PARTY_CALLBACK_CONFIRMED:
      return createInitialConversationTransition();

    default:
      return createInitialConversationTransition();
  }
}

function handleWeddingFlow(state: StoredConversationState, input: ChatInput): ChatTransition {
  const context = cloneContext(state.context);
  const event = context.weddingEvent;

  switch (state.currentStep) {
    case ChatStep.WEDDING_EVENT_TYPE:
      event.eventType = input.quickReplyKey?.startsWith("event-type:")
        ? input.quickReplyKey.slice("event-type:".length)
        : input.value.trim();
      if (!event.eventType) {
        return {
          nextFlow: ChatFlow.WEDDING_EVENT,
          nextStep: ChatStep.WEDDING_EVENT_TYPE,
          nextContext: context,
          summary: "Wedding or event inquiry in progress.",
          outbound: buildRetry(buildWeddingTypeMessages(), "Please choose the event type."),
        };
      }
      return {
        nextFlow: ChatFlow.WEDDING_EVENT,
        nextStep: ChatStep.WEDDING_DATE,
        nextContext: context,
        summary: "Wedding or event inquiry in progress.",
        outbound: buildWeddingDateMessages(),
      };

    case ChatStep.WEDDING_DATE:
      event.dateValue = input.quickReplyKey?.startsWith("date:")
        ? input.quickReplyKey.slice("date:".length)
        : undefined;
      event.dateLabel = input.value.trim() || event.dateValue;
      if (!event.dateLabel) {
        return {
          nextFlow: ChatFlow.WEDDING_EVENT,
          nextStep: ChatStep.WEDDING_DATE,
          nextContext: context,
          summary: "Wedding or event inquiry in progress.",
          outbound: buildRetry(buildWeddingDateMessages(), "Please share the event date."),
        };
      }
      return {
        nextFlow: ChatFlow.WEDDING_EVENT,
        nextStep: ChatStep.WEDDING_GUEST_COUNT,
        nextContext: context,
        summary: "Wedding or event inquiry in progress.",
        outbound: buildWeddingGuestMessages(),
      };

    case ChatStep.WEDDING_GUEST_COUNT:
      event.guestCount =
        input.quickReplyKey?.startsWith("guests:")
          ? Number(input.quickReplyKey.slice("guests:".length))
          : extractNumber(input.value) ?? undefined;
      if (!event.guestCount || event.guestCount < 1) {
        return {
          nextFlow: ChatFlow.WEDDING_EVENT,
          nextStep: ChatStep.WEDDING_GUEST_COUNT,
          nextContext: context,
          summary: "Wedding or event inquiry in progress.",
          outbound: buildRetry(buildWeddingGuestMessages(), "Please share the expected guest count."),
        };
      }
      return {
        nextFlow: ChatFlow.WEDDING_EVENT,
        nextStep: ChatStep.WEDDING_BUDGET,
        nextContext: context,
        summary: "Wedding or event inquiry in progress.",
        outbound: buildWeddingBudgetMessages(),
      };

    case ChatStep.WEDDING_BUDGET:
      event.budgetRange = input.quickReplyKey?.startsWith("budget:")
        ? input.quickReplyKey.slice("budget:".length)
        : input.value.trim();
      if (!event.budgetRange) {
        return {
          nextFlow: ChatFlow.WEDDING_EVENT,
          nextStep: ChatStep.WEDDING_BUDGET,
          nextContext: context,
          summary: "Wedding or event inquiry in progress.",
          outbound: buildRetry(buildWeddingBudgetMessages(), "Please choose a budget range."),
        };
      }
      return {
        nextFlow: ChatFlow.WEDDING_EVENT,
        nextStep: ChatStep.WEDDING_NOTES,
        nextContext: context,
        summary: "Wedding or event inquiry in progress.",
        outbound: buildWeddingNotesMessages(),
      };

    case ChatStep.WEDDING_NOTES:
      event.notes = input.quickReplyKey === "wedding-note:none" ? "No extra notes" : input.value.trim();
      if (!event.notes) {
        return {
          nextFlow: ChatFlow.WEDDING_EVENT,
          nextStep: ChatStep.WEDDING_NOTES,
          nextContext: context,
          summary: "Wedding or event inquiry in progress.",
          outbound: buildRetry(buildWeddingNotesMessages(), "Please add a note or choose No extra notes."),
        };
      }
      return {
        nextFlow: ChatFlow.WEDDING_EVENT,
        nextStep: ChatStep.WEDDING_SUMMARY,
        nextContext: context,
        summary: "Wedding or event inquiry summary ready.",
        outbound: buildWeddingSummaryMessages(event),
      };

    case ChatStep.WEDDING_SUMMARY:
      if (matchesSubmit(input, "wedding:submit", ["submit", "confirm"])) {
        return {
          nextFlow: ChatFlow.WEDDING_EVENT,
          nextStep: ChatStep.WEDDING_SUBMITTED,
          nextContext: context,
          summary: "Wedding or event inquiry submitted.",
          outbound: [],
          intent: { type: "CREATE_WEDDING_INQUIRY" },
        };
      }
      return {
        nextFlow: ChatFlow.WEDDING_EVENT,
        nextStep: ChatStep.WEDDING_SUMMARY,
        nextContext: context,
        summary: "Wedding or event inquiry summary ready.",
        outbound: buildRetry(buildWeddingSummaryMessages(event), "Please submit the event inquiry when you are ready."),
      };

    case ChatStep.WEDDING_SUBMITTED:
      return createInitialConversationTransition();

    default:
      return createInitialConversationTransition();
  }
}

function handleMenuFlow(
  state: StoredConversationState,
  input: ChatInput,
  runtime: ChatRuntimeData,
): ChatTransition {
  const context = cloneContext(state.context);
  const menu = context.menu;

  if (matchesSubmit(input, "menu:start-order", ["start order", "order"])) {
    return startFlow(ChatFlow.ORDER_FOOD, runtime);
  }

  switch (state.currentStep) {
    case ChatStep.MENU_CATEGORY: {
      const category = findCategory(runtime, input);
      if (!category) {
        return {
          nextFlow: ChatFlow.MENU_PRICE_LIST,
          nextStep: ChatStep.MENU_CATEGORY,
          nextContext: context,
          summary: "Menu browsing in progress.",
          outbound: buildRetry(
            buildMenuCategoryMessages(runtime),
            "Please choose a category to browse or jump into the order flow.",
          ),
        };
      }

      menu.selectedCategoryId = category.id;
      menu.selectedCategoryName = category.name;

      return {
        nextFlow: ChatFlow.MENU_PRICE_LIST,
        nextStep: ChatStep.MENU_BROWSING,
        nextContext: context,
        summary: `Browsing ${category.name}.`,
        outbound: buildMenuBrowsingMessages(runtime, menu),
      };
    }

    case ChatStep.MENU_BROWSING:
      if (matchesSubmit(input, "menu:browse-more", ["browse", "another"])) {
        menu.selectedCategoryId = undefined;
        menu.selectedCategoryName = undefined;
        return {
          nextFlow: ChatFlow.MENU_PRICE_LIST,
          nextStep: ChatStep.MENU_CATEGORY,
          nextContext: context,
          summary: "Menu browsing in progress.",
          outbound: buildMenuCategoryMessages(runtime, "Absolutely. Which category would you like to browse next?"),
        };
      }

      return {
        nextFlow: ChatFlow.MENU_PRICE_LIST,
        nextStep: ChatStep.MENU_BROWSING,
        nextContext: context,
        summary: "Menu browsing in progress.",
        outbound: buildRetry(
          buildMenuBrowsingMessages(runtime, menu),
          "You can browse another category, start an order, or return to the main menu.",
        ),
      };

    default:
      return startFlow(ChatFlow.MENU_PRICE_LIST, runtime);
  }
}

function handleContactFlow(
  state: StoredConversationState,
  runtime: ChatRuntimeData,
): ChatTransition {
  return {
    nextFlow: ChatFlow.CONTACT_INFO,
    nextStep: ChatStep.CONTACT_DETAILS,
    nextContext: state.context,
    summary: "Contact details shared in chat.",
    outbound: buildContactMessages(runtime),
  };
}

export function resolveChatTransition(
  state: StoredConversationState,
  input: ChatInput,
  runtime: ChatRuntimeData,
): ChatTransition {
  if (isMainMenu(input)) {
    return createInitialConversationTransition();
  }

  if (input.quickReplyKey === "flow:order") {
    return startFlow(ChatFlow.ORDER_FOOD, runtime);
  }

  if (input.quickReplyKey === "flow:table") {
    return startFlow(ChatFlow.TABLE_BOOKING, runtime);
  }

  if (input.quickReplyKey === "flow:party") {
    return startFlow(ChatFlow.BIRTHDAY_PARTY, runtime);
  }

  if (input.quickReplyKey === "flow:wedding") {
    return startFlow(ChatFlow.WEDDING_EVENT, runtime);
  }

  if (input.quickReplyKey === "flow:menu") {
    return startFlow(ChatFlow.MENU_PRICE_LIST, runtime);
  }

  if (input.quickReplyKey === "flow:contact") {
    return startFlow(ChatFlow.CONTACT_INFO, runtime);
  }

  switch (state.currentFlow) {
    case ChatFlow.WELCOME:
      return handleWelcome(input, runtime);
    case ChatFlow.ORDER_FOOD:
      return handleOrderFlow(state, input, runtime);
    case ChatFlow.TABLE_BOOKING:
      return handleTableBookingFlow(state, input);
    case ChatFlow.BIRTHDAY_PARTY:
      return handlePartyFlow(state, input);
    case ChatFlow.WEDDING_EVENT:
      return handleWeddingFlow(state, input);
    case ChatFlow.MENU_PRICE_LIST:
      return handleMenuFlow(state, input, runtime);
    case ChatFlow.CONTACT_INFO:
      return handleContactFlow(state, runtime);
    default:
      return createInitialConversationTransition();
  }
}

function parseDateValue(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(Date.now() + 86400000);
  }

  return new Date(`${value}T19:30:00`);
}

function parseBookingDateTime(dateValue?: string, timeLabel?: string) {
  const date = parseDateValue(dateValue);
  const time = timeLabel?.match(/(\d{1,2}):(\d{2})/);

  if (!time) {
    return date;
  }

  let hours = Number(time[1]);
  const minutes = Number(time[2]);
  const normalizedLabel = normalize(timeLabel ?? "");

  if (normalizedLabel.includes("pm") && hours < 12) {
    hours += 12;
  }
  if (normalizedLabel.includes("am") && hours === 12) {
    hours = 0;
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function getIntentPayload(
  intent: ChatRecordIntent,
  runtime: ChatRuntimeData,
  context: ConversationContext,
) {
  switch (intent.type) {
    case "CREATE_ORDER_PENDING":
      return {
        orderType: context.order.orderType ?? "DELIVERY",
        addressOrNote: context.order.addressOrNote ?? "",
        cart: context.order.cart,
        totals: getOrderTotals(runtime, context.order),
      };
    case "CREATE_TABLE_BOOKING":
      return {
        guestCount: context.tableBooking.guestCount ?? 2,
        bookingDateTime: parseBookingDateTime(
          context.tableBooking.dateValue,
          context.tableBooking.timeLabel,
        ),
      };
    case "CREATE_PARTY_INQUIRY":
      return {
        guestCount: context.birthdayParty.guestCount ?? 20,
        eventDate: parseDateValue(context.birthdayParty.dateValue),
      };
    case "CREATE_WEDDING_INQUIRY":
      return {
        guestCount: context.weddingEvent.guestCount ?? 80,
        eventDate: parseDateValue(context.weddingEvent.dateValue),
      };
    default:
      return null;
  }
}

export function buildPostIntentMessages(
  intent: ChatRecordIntent,
  runtime: ChatRuntimeData,
  context: ConversationContext,
  effect: ChatEffectResult,
): ChatDraftMessage[] {
  if (intent.type === "CREATE_ORDER_PENDING") {
    const totals = getOrderTotals(runtime, context.order);

    return [
      {
        direction: "SYSTEM",
        messageType: "SYSTEM",
        content: "Order created successfully",
      },
      {
        direction: "SYSTEM",
        messageType: "SYSTEM",
        content: `Payment requested for ${effect.reference}`,
      },
      cardMessage({
        kind: "status",
        tone: "amber",
        title: "Payment request created",
        subtitle: effect.reference,
        badge: "Awaiting payment",
        rows: [
          { label: "Amount due", value: formatCurrency(totals.totalInPaise, runtime.restaurant.currency) },
          { label: "Order type", value: context.order.orderType ?? "Delivery" },
          { label: "UPI link", value: "demo.mirchmasala/pay" },
        ],
        footnote: "Payment is still pending. The control panel can now simulate success or failure.",
      }),
      promptMessage(
        "The order is now sitting in a pending payment state. You can return to the main menu or browse the menu again.",
        [
          option("flow:menu", "Browse Menu", "See more featured dishes"),
          buildMainMenuOption(),
        ],
        {
          inputPlaceholder: "Type menu or main menu",
        },
      ),
    ];
  }

  if (intent.type === "CREATE_TABLE_BOOKING") {
    return [
      {
        direction: "SYSTEM",
        messageType: "SYSTEM",
        content: "Booking request sent",
      },
      cardMessage({
        kind: "status",
        tone: "amber",
        title: "Booking request submitted",
        subtitle: effect.reference,
        badge: "Pending approval",
        rows: [
          { label: "Date", value: context.tableBooking.dateLabel ?? "TBD" },
          { label: "Time", value: context.tableBooking.timeLabel ?? "TBD" },
          { label: "Guests", value: `${context.tableBooking.guestCount ?? 0}` },
        ],
        footnote: "Our host team will review this and confirm availability.",
      }),
      promptMessage(
        "Your booking request is now pending approval. I can take you back to the main menu whenever you are ready.",
        [buildMainMenuOption()],
        {
          inputPlaceholder: "Type main menu",
        },
      ),
    ];
  }

  if (intent.type === "CREATE_PARTY_INQUIRY") {
    return [
      {
        direction: "SYSTEM",
        messageType: "SYSTEM",
        content: "Our team will contact you",
      },
      cardMessage({
        kind: "status",
        tone: "amber",
        title: "Celebration inquiry submitted",
        subtitle: effect.reference,
        badge: "Callback queued",
        rows: [
          { label: "Date", value: context.birthdayParty.dateLabel ?? "TBD" },
          { label: "Guests", value: `${context.birthdayParty.guestCount ?? 0}` },
          { label: "Budget", value: context.birthdayParty.budgetRange ?? "TBD" },
        ],
        footnote: "A Mirch Masala celebrations specialist will call back shortly.",
      }),
      promptMessage(
        "Your callback confirmation is in place. I can return to the main menu or help with another flow.",
        [buildMainMenuOption()],
        {
          inputPlaceholder: "Type main menu",
        },
      ),
    ];
  }

  return [
    {
      direction: "SYSTEM",
      messageType: "SYSTEM",
      content: "Our team will contact you",
    },
    cardMessage({
      kind: "status",
      tone: "emerald",
      title: "Event inquiry submitted",
      subtitle: effect.reference,
      badge: "Proposal next",
      rows: [
        { label: "Event type", value: context.weddingEvent.eventType ?? "Event" },
        { label: "Date", value: context.weddingEvent.dateLabel ?? "TBD" },
        { label: "Guests", value: `${context.weddingEvent.guestCount ?? 0}` },
      ],
      footnote: "The events team will review the brief and prepare the next response.",
    }),
    promptMessage(
      "Your event inquiry has been submitted successfully. I can bring you back to the main menu whenever you like.",
      [buildMainMenuOption()],
      {
        inputPlaceholder: "Type main menu",
      },
    ),
  ];
}

export function hydrateFlowSummary(flow: string) {
  switch (flow) {
    case ChatFlow.ORDER_FOOD:
      return "Ordering";
    case ChatFlow.TABLE_BOOKING:
      return "Table booking";
    case ChatFlow.BIRTHDAY_PARTY:
      return "Party inquiry";
    case ChatFlow.WEDDING_EVENT:
      return "Wedding / event";
    case ChatFlow.MENU_PRICE_LIST:
      return "Menu browsing";
    case ChatFlow.CONTACT_INFO:
      return "Contact details";
    default:
      return "Welcome";
  }
}

export function findInputValueFromQuickReply(messageContent: string, options: ChatQuickReply[], quickReplyKey?: string | null) {
  if (!quickReplyKey) {
    return messageContent;
  }

  return options.find((entry) => entry.key === quickReplyKey)?.label ?? messageContent;
}

export function matchesFreeText(value: string, target: string) {
  const pattern = new RegExp(`\\b${escapeRegExp(normalize(target))}\\b`);
  return pattern.test(normalize(value));
}
