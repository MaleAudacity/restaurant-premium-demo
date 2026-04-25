import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // JWT sessions — no DB adapter needed, avoids custom adapter complexity
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      try {
        // Upsert customer record on first Google sign-in
        const existing = await prisma.customer.findFirst({ where: { email: user.email } });
        if (!existing) {
          const restaurant = await prisma.restaurant.findFirst();
          if (!restaurant) return false;
          const nameParts = (user.name ?? "").split(" ");
          await prisma.customer.create({
            data: {
              restaurantId: restaurant.id,
              firstName: nameParts[0] ?? "Customer",
              lastName: nameParts.slice(1).join(" ") || null,
              email: user.email,
              image: user.image ?? null,
              phone: "",
            },
          });
        }
        return true;
      } catch {
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const customer = await prisma.customer.findFirst({ where: { email: user.email } });
        if (customer) token.customerId = customer.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.customerId as string ?? token.sub ?? "";
      }
      return session;
    },
  },
});
