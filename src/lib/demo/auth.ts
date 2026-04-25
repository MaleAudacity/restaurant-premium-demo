import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { DEFAULT_RESTAURANT_SLUG } from "@/lib/constants";
import { isDatabaseReachable } from "@/lib/database-status";
import { prisma } from "@/lib/prisma";
import { demoUsers } from "@/lib/demo/demo-data";

export const DEMO_ROLE_COOKIE = "mirch-masala-demo-role";

export type DemoSession = {
  userId: string;
  restaurantId: string;
  role: string;
  name: string;
  email: string;
};

function getFallbackSession(role: string): DemoSession | null {
  const user = demoUsers.find((entry) => entry.role === role);
  if (!user) {
    return null;
  }

  return {
    userId: `fallback-${role.toLowerCase()}`,
    restaurantId: `fallback-${DEFAULT_RESTAURANT_SLUG}`,
    role: user.role,
    name: user.name,
    email: user.email,
  };
}

export async function getDemoSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get(DEMO_ROLE_COOKIE)?.value;

  if (!role) {
    return null;
  }

  if (!(await isDatabaseReachable())) {
    return getFallbackSession(role);
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        role: role as UserRole,
        restaurant: {
          slug: DEFAULT_RESTAURANT_SLUG,
        },
      },
      include: {
        restaurant: true,
      },
    });

    if (!user) {
      return getFallbackSession(role);
    }

    return {
      userId: user.id,
      restaurantId: user.restaurantId,
      role: user.role,
      name: user.name,
      email: user.email,
    };
  } catch {
    return getFallbackSession(role);
  }
}

export async function requireDemoSession() {
  const session = await getDemoSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
