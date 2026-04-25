"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";

import { DEMO_ROLE_COOKIE } from "@/lib/demo/auth";

const loginSchema = z.object({
  role: z.enum(["OWNER", "MANAGER", "KITCHEN", "DELIVERY"]),
});

export async function loginAsRole(formData: FormData) {
  const parsed = loginSchema.safeParse({
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  cookieStore.set(DEMO_ROLE_COOKIE, parsed.data.role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/dashboard");
}

export async function logoutDemoUser() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_ROLE_COOKIE);
  redirect("/login");
}
