"use server";

import webpush from "web-push";
import { prisma } from "@/lib/prisma";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function saveSubscription(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  customerId?: string,
) {
  const restaurant = await prisma.restaurant.findFirst();
  if (!restaurant) return { success: false };

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      restaurantId: restaurant.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      customerId: customerId ?? null,
    },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      customerId: customerId ?? null,
    },
  });

  return { success: true };
}

export async function sendPushToAll(
  restaurantId: string,
  payload: { title: string; body: string; url?: string },
) {
  const subs = await prisma.pushSubscription.findMany({ where: { restaurantId } });

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      ).catch(async (err: { statusCode?: number }) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {});
        }
        throw err as Error;
      }),
    ),
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return { sent, total: subs.length };
}

export async function sendPushToCustomer(
  customerId: string,
  payload: { title: string; body: string; url?: string },
) {
  const subs = await prisma.pushSubscription.findMany({ where: { customerId } });

  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      ),
    ),
  );
}
