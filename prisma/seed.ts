import {
  BookingStatus,
  ConversationChannel,
  ConversationStatus,
  EventInquiryStatus,
  InventoryState,
  MessageDirection,
  NotificationType,
  OrderStatus,
  OrderType,
  PaymentStatus,
  PrismaClient,
  UserRole,
} from "@prisma/client";

import {
  demoBookings,
  demoBusinessHours,
  demoCategories,
  demoConversationBlueprints,
  demoCustomers,
  demoDeliveryZones,
  demoEventInquiries,
  demoMenuItems,
  demoOrderBlueprints,
  demoRestaurant,
  demoUsers,
} from "../src/lib/demo/demo-data";
import { createInitialConversationTransition } from "../src/lib/demo/chat-engine";
import { DEMO_CHAT_EXTERNAL_REF } from "../src/lib/demo/chat-types";

const prisma = new PrismaClient();

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

async function resetDatabase() {
  await prisma.messageLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryStatus.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.tableBooking.deleteMany();
  await prisma.eventInquiry.deleteMany();
  await prisma.customerAddress.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.businessHour.deleteMany();
  await prisma.deliveryZone.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.restaurant.deleteMany();
}

async function main() {
  await resetDatabase();

  const now = new Date();

  const restaurant = await prisma.restaurant.create({
    data: {
      name: demoRestaurant.name,
      slug: demoRestaurant.slug,
      tagline: demoRestaurant.tagline,
      description: demoRestaurant.description,
      phone: demoRestaurant.phone,
      email: demoRestaurant.email,
      whatsappNumber: demoRestaurant.whatsapp,
      addressLine1: demoRestaurant.addressLine1,
      addressLine2: demoRestaurant.addressLine2,
      city: demoRestaurant.city,
      state: demoRestaurant.state,
      postalCode: demoRestaurant.postalCode,
      country: demoRestaurant.country,
      currency: demoRestaurant.currency,
      timezone: demoRestaurant.timezone,
      accentColor: demoRestaurant.accentColor,
      secondaryColor: demoRestaurant.secondaryColor,
      coverImageUrl:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      metadata: {
        brandTone: "warm-luxury",
        heroStats: demoRestaurant.heroStats,
      },
    },
  });

  for (const hour of demoBusinessHours) {
    await prisma.businessHour.create({
      data: {
        restaurantId: restaurant.id,
        ...hour,
      },
    });
  }

  for (const zone of demoDeliveryZones) {
    await prisma.deliveryZone.create({
      data: {
        restaurantId: restaurant.id,
        ...zone,
      },
    });
  }

  const userMap = new Map<string, { id: string; role: UserRole }>();
  for (const user of demoUsers) {
    const createdUser = await prisma.user.create({
      data: {
        restaurantId: restaurant.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        title: user.title,
        passwordHash: `demo-${user.role.toLowerCase()}`,
        lastSeenAt: now,
      },
    });
    userMap.set(user.role, { id: createdUser.id, role: createdUser.role });
  }

  const customerMap = new Map<string, { id: string; name: string }>();
  for (const customer of demoCustomers) {
    const createdCustomer = await prisma.customer.create({
      data: {
        restaurantId: restaurant.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
        preferredChannel: ConversationChannel.WHATSAPP,
      },
    });

    for (const address of customer.addresses) {
      await prisma.customerAddress.create({
        data: {
          restaurantId: restaurant.id,
          customerId: createdCustomer.id,
          ...address,
        },
      });
    }

    customerMap.set(customer.phone, {
      id: createdCustomer.id,
      name: `${customer.firstName} ${customer.lastName ?? ""}`.trim(),
    });
  }

  const categoryMap = new Map<string, string>();
  for (const category of demoCategories) {
    const createdCategory = await prisma.menuCategory.create({
      data: {
        restaurantId: restaurant.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        sortOrder: category.sortOrder,
      },
    });
    categoryMap.set(category.slug, createdCategory.id);
  }

  const menuItemMap = new Map<string, { id: string; priceInPaise: number; name: string }>();
  let itemIndex = 0;
  for (const item of demoMenuItems) {
    const createdItem = await prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: categoryMap.get(item.categorySlug)!,
        name: item.name,
        slug: item.slug,
        description: item.description,
        priceInPaise: item.priceInPaise,
        spiceLevel: item.spiceLevel,
        isVegetarian: item.isVegetarian,
        isFeatured: item.isFeatured ?? false,
        dietaryTags: item.dietaryTags,
        prepTimeMinutes: item.prepTimeMinutes,
        imageUrl: `https://images.unsplash.com/photo-${1512058564366 + itemIndex}?auto=format&fit=crop&w=900&q=80`,
      },
    });

    const state =
      itemIndex % 11 === 0
        ? InventoryState.OUT_OF_STOCK
        : itemIndex % 5 === 0
          ? InventoryState.LOW_STOCK
          : InventoryState.IN_STOCK;

    await prisma.inventoryStatus.create({
      data: {
        restaurantId: restaurant.id,
        menuItemId: createdItem.id,
        state,
        quantityAvailable: state === InventoryState.OUT_OF_STOCK ? 0 : 12 - (itemIndex % 6),
        lowStockThreshold: 3,
        notes:
          state === InventoryState.LOW_STOCK
            ? "Reorder before evening peak."
            : state === InventoryState.OUT_OF_STOCK
              ? "Supplier replenishment due tomorrow morning."
              : "Healthy buffer in stock.",
      },
    });

    menuItemMap.set(item.slug, {
      id: createdItem.id,
      priceInPaise: item.priceInPaise,
      name: item.name,
    });
    itemIndex += 1;
  }

  const orderMap = new Map<string, string>();
  for (const [index, blueprint] of demoOrderBlueprints.entries()) {
    const customer = customerMap.get(blueprint.customerPhone)!;
    const subtotal = blueprint.items.reduce((sum, line) => {
      const item = menuItemMap.get(line.menuSlug)!;
      return sum + item.priceInPaise * line.quantity;
    }, 0);
    const deliveryFee =
      blueprint.orderType === "DELIVERY" ? demoDeliveryZones[0].deliveryFeeInPaise : 0;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + deliveryFee + tax;
    const placedAt = addHours(now, -(index + 1) * 1.5);

    const order = await prisma.order.create({
      data: {
        restaurantId: restaurant.id,
        customerId: customer.id,
        orderNumber: blueprint.orderNumber,
        orderType: blueprint.orderType as OrderType,
        status: blueprint.status as OrderStatus,
        paymentStatus: blueprint.paymentStatus as PaymentStatus,
        paymentMethod: blueprint.paymentMethod,
        subtotalInPaise: subtotal,
        deliveryFeeInPaise: deliveryFee,
        taxInPaise: tax,
        totalInPaise: total,
        notes: blueprint.notes,
        deliveryAddressText:
          blueprint.orderType === "DELIVERY"
            ? demoCustomers.find((entry) => entry.phone === blueprint.customerPhone)?.addresses[0]
                ?.line1
            : null,
        placedAt,
        readyAt:
          blueprint.status === "READY" ||
          blueprint.status === "OUT_FOR_DELIVERY" ||
          blueprint.status === "COMPLETED"
            ? addHours(placedAt, 0.7)
            : null,
        deliveredAt:
          blueprint.status === "COMPLETED" ? addHours(placedAt, 1.3) : null,
      },
    });

    for (const line of blueprint.items) {
      const item = menuItemMap.get(line.menuSlug)!;
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          menuItemId: item.id,
          nameSnapshot: item.name,
          unitPriceInPaise: item.priceInPaise,
          quantity: line.quantity,
          totalPriceInPaise: item.priceInPaise * line.quantity,
        },
      });
    }

    await prisma.payment.create({
      data: {
        restaurantId: restaurant.id,
        orderId: order.id,
        amountInPaise: total,
        status: blueprint.paymentStatus as PaymentStatus,
        provider: blueprint.paymentMethod === "UPI" ? "Razorpay" : "Stripe Demo",
        reference: `${blueprint.orderNumber}-PAY`,
        failureReason:
          blueprint.paymentStatus === "FAILED"
            ? "Customer authentication timed out."
            : null,
        paidAt: blueprint.paymentStatus === "SUCCESS" ? addHours(placedAt, 0.2) : null,
      },
    });

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalOrders: { increment: 1 },
        totalSpendInPaise: { increment: total },
        lastOrderAt: placedAt,
      },
    });

    orderMap.set(blueprint.orderNumber, order.id);
  }

  const bookingMap = new Map<string, string>();
  for (const booking of demoBookings) {
    const customer = customerMap.get(booking.customerPhone)!;
    const bookingDate = addHours(
      addDays(now, booking.bookingDateOffsetDays),
      booking.bookingHour - now.getHours(),
    );

    const createdBooking = await prisma.tableBooking.create({
      data: {
        restaurantId: restaurant.id,
        customerId: customer.id,
        bookingReference: booking.bookingReference,
        guestCount: booking.guestCount,
        bookingDateTime: bookingDate,
        status: booking.status as BookingStatus,
        seatingPreference: booking.seatingPreference,
        specialOccasion: booking.specialOccasion,
        source: booking.source,
        notes: `Auto-seeded ${booking.specialOccasion?.toLowerCase() ?? "table booking"}.`,
      },
    });
    bookingMap.set(booking.bookingReference, createdBooking.id);
  }

  const eventMap = new Map<string, string>();
  for (const event of demoEventInquiries) {
    const customer = customerMap.get(event.customerPhone)!;
    const createdEvent = await prisma.eventInquiry.create({
      data: {
        restaurantId: restaurant.id,
        customerId: customer.id,
        inquiryReference: event.inquiryReference,
        eventType: event.eventType,
        guestCount: event.guestCount,
        eventDate: addDays(now, event.eventDateOffsetDays),
        budgetRange: event.budgetRange,
        status: event.status as EventInquiryStatus,
        venuePreference: event.venuePreference,
        source: event.source,
        notes: event.notes,
      },
    });
    eventMap.set(event.inquiryReference, createdEvent.id);
  }

  for (const [index, blueprint] of demoConversationBlueprints.entries()) {
    const customer = customerMap.get(blueprint.customerPhone)!;
    const conversation = await prisma.conversation.create({
      data: {
        restaurantId: restaurant.id,
        customerId: customer.id,
        channel: blueprint.channel as ConversationChannel,
        status: ConversationStatus.OPEN,
        summary: blueprint.summary,
        lastMessageAt: addHours(now, -(index + 1)),
        bookingId: index === 1 ? bookingMap.get("BK-2202") : undefined,
        eventInquiryId:
          index === 1
            ? eventMap.get("EV-3301")
            : index === 2
              ? eventMap.get("EV-3303")
              : undefined,
      },
    });

    if (index === 0) {
      await prisma.order.update({
        where: {
          restaurantId_orderNumber: {
            restaurantId: restaurant.id,
            orderNumber: "MM-1001",
          },
        },
        data: {
          conversationId: conversation.id,
        },
      });
    }

    for (const [messageIndex, message] of blueprint.messages.entries()) {
      await prisma.messageLog.create({
        data: {
          restaurantId: restaurant.id,
          conversationId: conversation.id,
          direction: message.direction as MessageDirection,
          messageType: message.direction === "SYSTEM" ? "SYSTEM" : "TEXT",
          content: message.content,
          createdAt: addHours(now, -(index + 1) + messageIndex * 0.15),
        },
      });
    }
  }

  const primaryCustomer = customerMap.get("+91 90000 10001");
  if (primaryCustomer) {
    const welcomeTransition = createInitialConversationTransition();
    const primaryConversation = await prisma.conversation.create({
      data: {
        restaurantId: restaurant.id,
        customerId: primaryCustomer.id,
        channel: ConversationChannel.WHATSAPP,
        status: ConversationStatus.OPEN,
        externalRef: DEMO_CHAT_EXTERNAL_REF,
        summary: welcomeTransition.summary,
        currentFlow: welcomeTransition.nextFlow,
        currentStep: welcomeTransition.nextStep,
        contextJson: welcomeTransition.nextContext,
        lastMessageAt: now,
      },
    });

    for (const [messageIndex, message] of welcomeTransition.outbound.entries()) {
      await prisma.messageLog.create({
        data: {
          restaurantId: restaurant.id,
          conversationId: primaryConversation.id,
          direction: message.direction as MessageDirection,
          messageType: message.messageType ?? "TEXT",
          content: message.content,
          metadata: message.metadata ?? undefined,
          createdAt: addHours(now, messageIndex * 0.01),
        },
      });
    }
  }

  const notifications = [
    {
      type: NotificationType.ORDER,
      title: "New delivery order",
      body: "Order MM-1001 is waiting for manager approval.",
      href: "/orders",
    },
    {
      type: NotificationType.PAYMENT,
      title: "Payment needs retry",
      body: "Order MM-1006 failed payment verification.",
      href: "/orders",
    },
    {
      type: NotificationType.BOOKING,
      title: "Birthday booking request",
      body: "BK-2202 needs confirmation for private lounge seating.",
      href: "/bookings",
    },
    {
      type: NotificationType.EVENT,
      title: "Wedding inquiry received",
      body: "EV-3303 is a high-value full restaurant buyout lead.",
      href: "/events",
    },
    {
      type: NotificationType.KITCHEN,
      title: "Kitchen queue steady",
      body: "Pending and preparing boards are balanced for tonight's service.",
      href: "/kitchen",
    },
  ];

  for (const [index, notification] of notifications.entries()) {
    await prisma.notification.create({
      data: {
        restaurantId: restaurant.id,
        userId:
          index < 2
            ? userMap.get("MANAGER")?.id
            : index === 4
              ? userMap.get("KITCHEN")?.id
              : userMap.get("OWNER")?.id,
        ...notification,
        createdAt: addHours(now, -index * 0.5),
      },
    });
  }

  const auditEntries = [
    {
      action: "seed.restaurant.created",
      entityType: "Restaurant",
      entityId: restaurant.id,
      description: "Initialized Mirch Masala demo restaurant.",
      userId: userMap.get("OWNER")?.id,
    },
    {
      action: "seed.orders.loaded",
      entityType: "Order",
      entityId: orderMap.get("MM-1001")!,
      description: "Inserted seeded order queue across lifecycle states.",
      userId: userMap.get("MANAGER")?.id,
    },
    {
      action: "seed.events.loaded",
      entityType: "EventInquiry",
      entityId: eventMap.get("EV-3303")!,
      description: "Inserted premium event lead scenarios for demo flows.",
      userId: userMap.get("OWNER")?.id,
    },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({
      data: {
        restaurantId: restaurant.id,
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        description: entry.description,
      },
    });
  }

  console.log(
    `Seeded ${restaurant.name} with ${demoMenuItems.length} menu items, ${demoOrderBlueprints.length} orders, ${demoBookings.length} bookings, and ${demoEventInquiries.length} event inquiries.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
