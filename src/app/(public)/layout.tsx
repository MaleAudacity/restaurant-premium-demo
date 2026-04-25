import { PublicShell } from "@/components/layout/public-shell";
import { CartProvider } from "@/components/cart/cart-provider";
import { SessionProvider } from "@/components/auth/session-provider";
import { getRestaurantSnapshot } from "@/server/queries";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const restaurant = await getRestaurantSnapshot();

  return (
    <SessionProvider>
      <CartProvider>
        <PublicShell restaurantName={restaurant.name}>{children}</PublicShell>
      </CartProvider>
    </SessionProvider>
  );
}
