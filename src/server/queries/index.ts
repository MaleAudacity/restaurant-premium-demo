import { unstable_noStore as noStore } from "next/cache";

import { DEFAULT_RESTAURANT_SLUG } from "@/lib/constants";
import { isDatabaseReachable } from "@/lib/database-status";
import { demoBusinessHours, demoCategories, demoConversationBlueprints, demoCustomers, demoDeliveryZones, demoMenuItems, demoRestaurant, demoTestimonials, demoUsers } from "@/lib/demo/demo-data";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

function getFallbackMenu() {
  return demoCategories.map((category) => ({
    ...category,
    items: demoMenuItems
      .filter((item) => item.categorySlug === category.slug)
      .map((item) => ({
        ...item,
        isAvailable: true,
        inventoryStatus: null,
        category: {
          name: category.name,
        },
      })),
  }));
}

export async function getRestaurantSnapshot() {
  noStore();

  if (!(await isDatabaseReachable())) {
    return {
      ...demoRestaurant,
      whatsappNumber: demoRestaurant.whatsapp,
      businessHours: demoBusinessHours,
      deliveryZones: demoDeliveryZones,
    };
  }

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        slug: DEFAULT_RESTAURANT_SLUG,
      },
      include: {
        businessHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
        deliveryZones: true,
      },
    });

    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    return restaurant;
  } catch {
    return {
      ...demoRestaurant,
      whatsappNumber: demoRestaurant.whatsapp,
      businessHours: demoBusinessHours,
      deliveryZones: demoDeliveryZones,
    };
  }
}

export async function getPublicLandingData() {
  noStore();

  if (!(await isDatabaseReachable())) {
    return {
      restaurant: await getRestaurantSnapshot(),
      heroStats: demoRestaurant.heroStats,
      categories: getFallbackMenu(),
      featuredItems: demoMenuItems
        .filter((item) => item.isFeatured)
        .map((item) => ({
          ...item,
          category: {
            name:
              demoCategories.find((category) => category.slug === item.categorySlug)?.name ??
              "Signature",
          },
        })),
      testimonials: demoTestimonials,
    };
  }

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: DEFAULT_RESTAURANT_SLUG },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            items: {
              where: { isAvailable: true },
              orderBy: { priceInPaise: "asc" },
              take: 4,
            },
          },
        },
        menuItems: {
          where: { isFeatured: true, isAvailable: true },
          include: { category: true },
          take: 6,
        },
      },
    });

    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    return {
      restaurant,
      heroStats:
        (restaurant.metadata as { heroStats?: Array<{ label: string; value: string }> } | null)
          ?.heroStats ?? demoRestaurant.heroStats,
      categories: restaurant.categories,
      featuredItems: restaurant.menuItems,
      testimonials: demoTestimonials,
    };
  } catch {
    return {
      restaurant: await getRestaurantSnapshot(),
      heroStats: demoRestaurant.heroStats,
      categories: getFallbackMenu(),
      featuredItems: demoMenuItems
        .filter((item) => item.isFeatured)
        .map((item) => ({
          ...item,
          category: {
            name:
              demoCategories.find((category) => category.slug === item.categorySlug)?.name ??
              "Signature",
          },
        })),
      testimonials: demoTestimonials,
    };
  }
}

export async function getMenuPageData() {
  noStore();

  if (!(await isDatabaseReachable())) {
    return getFallbackMenu();
  }

  try {
    const categories = await prisma.menuCategory.findMany({
      where: {
        restaurant: { slug: DEFAULT_RESTAURANT_SLUG },
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        items: {
          where: {
            isAvailable: true,
          },
          orderBy: {
            priceInPaise: "asc",
          },
          include: {
            inventoryStatus: true,
          },
        },
      },
    });

    return categories;
  } catch {
    return getFallbackMenu();
  }
}

export async function getMenuItemDetail(slug: string) {
  noStore();

  if (!(await isDatabaseReachable())) {
    const item = demoMenuItems.find((entry) => entry.slug === slug);

    if (!item) {
      return null;
    }

    return {
      item: {
        ...item,
        category: {
          name:
            demoCategories.find((entry) => entry.slug === item.categorySlug)?.name ?? "Menu Item",
        },
        inventoryStatus: null,
        isAvailable: true,
      },
      relatedItems: demoMenuItems
        .filter(
          (entry) => entry.categorySlug === item.categorySlug && entry.slug !== item.slug,
        )
        .slice(0, 3)
        .map((entry) => ({
          ...entry,
          category: {
            name:
              demoCategories.find((category) => category.slug === entry.categorySlug)?.name ??
              "Menu Item",
          },
        })),
    };
  }

  try {
    const item = await prisma.menuItem.findFirst({
      where: {
        slug,
        restaurant: {
          slug: DEFAULT_RESTAURANT_SLUG,
        },
      },
      include: {
        category: true,
        inventoryStatus: true,
      },
    });

    if (!item) {
      return null;
    }

    const relatedItems = await prisma.menuItem.findMany({
      where: {
        restaurant: { slug: DEFAULT_RESTAURANT_SLUG },
        categoryId: item.categoryId,
        id: { not: item.id },
        isAvailable: true,
      },
      take: 3,
    });

    return { item, relatedItems };
  } catch {
    const item = demoMenuItems.find((entry) => entry.slug === slug);

    if (!item) {
      return null;
    }

    return {
      item: {
        ...item,
        category: {
          name:
            demoCategories.find((entry) => entry.slug === item.categorySlug)?.name ?? "Menu Item",
        },
        inventoryStatus: null,
        isAvailable: true,
      },
      relatedItems: demoMenuItems
        .filter(
          (entry) => entry.categorySlug === item.categorySlug && entry.slug !== item.slug,
        )
        .slice(0, 3)
        .map((entry) => ({
          ...entry,
          category: {
            name:
              demoCategories.find((category) => category.slug === entry.categorySlug)?.name ??
              "Menu Item",
          },
        })),
    };
  }
}

export async function getDashboardSnapshot() {
  noStore();

  if (!(await isDatabaseReachable())) {
    return {
      stats: [
        {
          label: "Revenue Snapshot",
          value: formatCurrency(463000, demoRestaurant.currency),
          hint: "Fallback overview from demo seed blueprint",
        },
        {
          label: "Live Orders",
          value: "4",
          hint: "Kitchen and delivery queue in motion",
        },
        {
          label: "Bookings Pipeline",
          value: "3",
          hint: "Celebration tables awaiting service",
        },
        {
          label: "Event Leads",
          value: "3",
          hint: "High-value event opportunities",
        },
      ],
      orders: [],
      bookings: [],
      events: [],
      inventory: [],
      notifications: [],
    };
  }

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: DEFAULT_RESTAURANT_SLUG },
    });

    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    const [orders, bookings, events, inventory, notifications] = await Promise.all([
      prisma.order.findMany({
        where: { restaurantId: restaurant.id },
        include: {
          customer: true,
          items: true,
        },
        orderBy: { placedAt: "desc" },
        take: 8,
      }),
      prisma.tableBooking.findMany({
        where: { restaurantId: restaurant.id },
        include: { customer: true },
        orderBy: { bookingDateTime: "asc" },
        take: 6,
      }),
      prisma.eventInquiry.findMany({
        where: { restaurantId: restaurant.id },
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.inventoryStatus.findMany({
        where: { restaurantId: restaurant.id },
        include: { menuItem: true },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.notification.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const revenue = orders.reduce((sum, order) => sum + order.totalInPaise, 0);
    const liveOrders = orders.filter((order) =>
      ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(order.status),
    );

    return {
      stats: [
        {
          label: "Revenue Snapshot",
          value: formatCurrency(revenue, restaurant.currency),
          hint: `${orders.length} seeded orders across active states`,
        },
        {
          label: "Live Orders",
          value: String(liveOrders.length),
          hint: "Includes pending, kitchen, and dispatch stages",
        },
        {
          label: "Bookings Pipeline",
          value: String(bookings.length),
          hint: "Upcoming dine-in reservations and celebration tables",
        },
        {
          label: "Event Leads",
          value: String(events.length),
          hint: "Private dining, wedding, and corporate opportunities",
        },
      ],
      orders,
      bookings,
      events,
      inventory,
      notifications,
    };
  } catch {
    return {
      stats: [
        {
          label: "Revenue Snapshot",
          value: formatCurrency(463000, demoRestaurant.currency),
          hint: "Fallback overview from demo seed blueprint",
        },
        {
          label: "Live Orders",
          value: "4",
          hint: "Kitchen and delivery queue in motion",
        },
        {
          label: "Bookings Pipeline",
          value: "3",
          hint: "Celebration tables awaiting service",
        },
        {
          label: "Event Leads",
          value: "3",
          hint: "High-value event opportunities",
        },
      ],
      orders: [],
      bookings: [],
      events: [],
      inventory: [],
      notifications: [],
    };
  }
}

export async function getOrdersPageData() {
  noStore();

  if (!(await isDatabaseReachable())) {
    return [];
  }

  try {
    return await prisma.order.findMany({
      where: {
        restaurant: { slug: DEFAULT_RESTAURANT_SLUG },
      },
      include: {
        customer: true,
        items: true,
        payments: true,
        assignedDeliveryUser: { select: { id: true, name: true } },
        statusLogs: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { placedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getOrderDetail(orderId: string) {
  noStore();

  if (!(await isDatabaseReachable())) return null;

  try {
    return await prisma.order.findFirst({
      where: {
        id: orderId,
        restaurant: { slug: DEFAULT_RESTAURANT_SLUG },
      },
      include: {
        customer: true,
        items: true,
        payments: true,
        assignedDeliveryUser: { select: { id: true, name: true } },
        statusLogs: {
          orderBy: { createdAt: "asc" },
          include: { actorUser: { select: { name: true, role: true } } },
        },
        otpVerification: { select: { usedAt: true, attempts: true, expiresAt: true } },
      },
    });
  } catch {
    return null;
  }
}

export async function getDeliveryUsers() {
  noStore();

  if (!(await isDatabaseReachable())) {
    return [];
  }

  try {
    return await prisma.user.findMany({
      where: {
        restaurant: { slug: DEFAULT_RESTAURANT_SLUG },
        role: "DELIVERY",
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getDeliveryPageData() {
  noStore();

  if (!(await isDatabaseReachable())) {
    return { ready: [], inTransit: [], riders: [] };
  }

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: DEFAULT_RESTAURANT_SLUG },
    });
    if (!restaurant) return { ready: [], inTransit: [], riders: [] };

    const [orders, riders] = await Promise.all([
      prisma.order.findMany({
        where: {
          restaurantId: restaurant.id,
          status: { in: ["READY", "OUT_FOR_DELIVERY"] },
        },
        include: {
          customer: true,
          items: true,
          assignedDeliveryUser: { select: { id: true, name: true } },
          otpVerification: { select: { code: true, expiresAt: true, usedAt: true, attempts: true, maxAttempts: true } },
        },
        orderBy: { placedAt: "asc" },
      }),
      prisma.user.findMany({
        where: { restaurantId: restaurant.id, role: "DELIVERY" },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      ready: orders.filter((o) => o.status === "READY"),
      inTransit: orders.filter((o) => o.status === "OUT_FOR_DELIVERY"),
      riders,
    };
  } catch {
    return { ready: [], inTransit: [], riders: [] };
  }
}

export async function getBookingsPageData() {
  noStore();

  if (!(await isDatabaseReachable())) {
    return [];
  }

  try {
    return await prisma.tableBooking.findMany({
      where: {
        restaurant: { slug: DEFAULT_RESTAURANT_SLUG },
      },
      include: {
        customer: true,
      },
      orderBy: { bookingDateTime: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getEventsPageData() {
  noStore();

  if (!(await isDatabaseReachable())) {
    return [];
  }

  try {
    return await prisma.eventInquiry.findMany({
      where: {
        restaurant: { slug: DEFAULT_RESTAURANT_SLUG },
      },
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getKitchenPageData() {
  noStore();

  if (!(await isDatabaseReachable())) {
    return {
      confirmed: [],
      preparing: [],
      ready: [],
    };
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        restaurant: { slug: DEFAULT_RESTAURANT_SLUG },
        status: {
          in: ["CONFIRMED", "PREPARING", "READY"],
        },
      },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { placedAt: "asc" },
    });

    return {
      // CONFIRMED = approved by owner, waiting for kitchen to start
      confirmed: orders.filter((order) => order.status === "CONFIRMED"),
      preparing: orders.filter((order) => order.status === "PREPARING"),
      ready: orders.filter((order) => order.status === "READY"),
    };
  } catch {
    return {
      confirmed: [],
      preparing: [],
      ready: [],
    };
  }
}

export async function getAnalyticsPageData() {
  noStore();

  const fallback = {
    totalRevenue: 0,
    averageOrderValue: 0,
    statusBreakdown: {} as Record<string, number>,
    totalOrders: 0,
    dailyRevenue: [] as { date: string; revenueInPaise: number; orders: number }[],
    topItems: [] as { name: string; quantity: number; revenueInPaise: number }[],
    totalCustomers: 0,
    completedOrders: 0,
  };

  if (!(await isDatabaseReachable())) return fallback;

  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { slug: DEFAULT_RESTAURANT_SLUG } });
    if (!restaurant) return fallback;

    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [orders, orderItems, customerCount] = await Promise.all([
      prisma.order.findMany({
        where: { restaurantId: restaurant.id },
        select: { totalInPaise: true, status: true, placedAt: true, createdAt: true },
      }),
      prisma.orderItem.findMany({
        where: { order: { restaurantId: restaurant.id, placedAt: { gte: since30d } } },
        select: { nameSnapshot: true, quantity: true, totalPriceInPaise: true },
      }),
      prisma.customer.count({ where: { restaurantId: restaurant.id } }),
    ]);

    const totalRevenue = orders.reduce((s, o) => s + o.totalInPaise, 0);
    const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
    const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;

    const statusBreakdown = orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {});

    // Daily revenue last 30 days
    const dailyMap = new Map<string, { revenueInPaise: number; orders: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      dailyMap.set(d.toISOString().slice(0, 10), { revenueInPaise: 0, orders: 0 });
    }
    for (const o of orders) {
      const key = (o.placedAt ?? o.createdAt).toISOString().slice(0, 10);
      const entry = dailyMap.get(key);
      if (entry) { entry.revenueInPaise += o.totalInPaise; entry.orders += 1; }
    }
    const dailyRevenue = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }));

    // Top items by quantity
    const itemMap = new Map<string, { quantity: number; revenueInPaise: number }>();
    for (const item of orderItems) {
      const e = itemMap.get(item.nameSnapshot) ?? { quantity: 0, revenueInPaise: 0 };
      e.quantity += item.quantity;
      e.revenueInPaise += item.totalPriceInPaise;
      itemMap.set(item.nameSnapshot, e);
    }
    const topItems = Array.from(itemMap.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    return { totalRevenue, averageOrderValue, statusBreakdown, totalOrders: orders.length, dailyRevenue, topItems, totalCustomers: customerCount, completedOrders };
  } catch {
    return fallback;
  }
}

export async function getSettingsPageData() {
  noStore();

  if (!(await isDatabaseReachable())) {
    return {
      restaurant: { id: "", name: "Mirch Masala", tagline: "", phone: "", email: "", addressLine1: "", city: "" },
      users: demoUsers,
      businessHours: demoBusinessHours,
      deliveryZones: demoDeliveryZones.map((z, i) => ({ ...z, id: `demo-${i}`, isActive: true })),
    };
  }

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: DEFAULT_RESTAURANT_SLUG },
      include: {
        users: { select: { id: true, name: true, title: true, email: true, role: true, isActive: true } },
        businessHours: { orderBy: { dayOfWeek: "asc" } },
        deliveryZones: { orderBy: { name: "asc" } },
      },
    });

    if (!restaurant) {
      return {
        restaurant: { id: "", name: "Mirch Masala", tagline: "", phone: "", email: "", addressLine1: "", city: "" },
        users: demoUsers,
        businessHours: demoBusinessHours,
        deliveryZones: demoDeliveryZones.map((z, i) => ({ ...z, id: `demo-${i}`, isActive: true })),
      };
    }

    return {
      restaurant,
      users: restaurant.users,
      businessHours: restaurant.businessHours,
      deliveryZones: restaurant.deliveryZones,
    };
  } catch {
    return {
      restaurant: { id: "", name: "Mirch Masala", tagline: "", phone: "", email: "", addressLine1: "", city: "" },
      users: demoUsers,
      businessHours: demoBusinessHours,
      deliveryZones: demoDeliveryZones.map((z, i) => ({ ...z, id: `demo-${i}`, isActive: true })),
    };
  }
}

export async function getDemoChatPageData() {
  noStore();

  if (!(await isDatabaseReachable())) {
    return demoConversationBlueprints.map((conversation, index) => ({
      id: `fallback-conversation-${index + 1}`,
      contactName:
        demoCustomers.find((customer: (typeof demoCustomers)[number]) => customer.phone === conversation.customerPhone)
          ?.firstName ?? `Guest ${index + 1}`,
      summary: conversation.summary,
      messages: conversation.messages.map((message, messageIndex) => ({
        id: `fallback-message-${index + 1}-${messageIndex + 1}`,
        content: message.content,
        direction: message.direction,
      })),
    }));
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        restaurant: { slug: DEFAULT_RESTAURANT_SLUG },
      },
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    return conversations.map((conversation) => ({
      id: conversation.id,
      contactName: conversation.customer?.firstName ?? "Guest",
      summary: conversation.summary ?? "Guest conversation",
      messages: conversation.messages.map((message) => ({
        id: message.id,
        content: message.content,
        direction: message.direction,
      })),
    }));
  } catch {
    return demoConversationBlueprints.map((conversation, index) => ({
      id: `fallback-conversation-${index + 1}`,
      contactName:
        demoCustomers.find((customer: (typeof demoCustomers)[number]) => customer.phone === conversation.customerPhone)
          ?.firstName ?? `Guest ${index + 1}`,
      summary: conversation.summary,
      messages: conversation.messages.map((message, messageIndex) => ({
        id: `fallback-message-${index + 1}-${messageIndex + 1}`,
        content: message.content,
        direction: message.direction,
      })),
    }));
  }
}

export async function getDemoControlPageData() {
  const [dashboard, orders, bookings, events] = await Promise.all([
    getDashboardSnapshot(),
    getOrdersPageData(),
    getBookingsPageData(),
    getEventsPageData(),
  ]);

  return {
    dashboard,
    orders,
    bookings,
    events,
  };
}

export async function getMenuManagementData() {
  noStore();

  if (!(await isDatabaseReachable())) return [];

  try {
    return await prisma.menuCategory.findMany({
      where: { restaurant: { slug: DEFAULT_RESTAURANT_SLUG } },
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          orderBy: { name: "asc" },
        },
      },
    });
  } catch {
    return [];
  }
}

export async function getBookingsPageDataFull() {
  noStore();

  if (!(await isDatabaseReachable())) return [];

  try {
    return await prisma.tableBooking.findMany({
      where: { restaurant: { slug: DEFAULT_RESTAURANT_SLUG } },
      include: { customer: true },
      orderBy: { bookingDateTime: "asc" },
    });
  } catch {
    return [];
  }
}
