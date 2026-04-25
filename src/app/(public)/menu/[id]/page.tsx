import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { getMenuItemDetail, getRestaurantSnapshot } from "@/server/queries";
import { formatCurrency } from "@/lib/utils";

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [payload, restaurant] = await Promise.all([
    getMenuItemDetail(id),
    getRestaurantSnapshot(),
  ]);

  if (!payload) {
    notFound();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-amber-200/76">
          {payload.item.category?.name ?? "Signature Dish"}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-stone-50">{payload.item.name}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300/80">
          {payload.item.description}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <StatusBadge status={payload.item.isVegetarian ? "vegetarian" : "chef_special"} />
          {payload.item.spiceLevel ? (
            <StatusBadge status={`spice_${payload.item.spiceLevel}`} />
          ) : null}
          <StatusBadge
            status={
              payload.item.inventoryStatus?.state?.toString?.() ??
              (payload.item.isAvailable ? "in_stock" : "out_of_stock")
            }
          />
        </div>
        <div className="mt-8 flex items-center justify-between rounded-[28px] border border-white/10 bg-black/20 px-6 py-5">
          <div>
            <p className="text-sm text-stone-300/78">Current demo price</p>
            <p className="font-serif text-4xl text-amber-100">
              {formatCurrency(payload.item.priceInPaise, restaurant.currency)}
            </p>
          </div>
          <AddToCartButton
            slug={payload.item.slug}
            name={payload.item.name}
            priceInPaise={payload.item.priceInPaise}
          />
        </div>
      </Card>
      <Card className="p-8">
        <h2 className="font-serif text-3xl text-stone-50">Recommended with this dish</h2>
        <div className="mt-6 space-y-4">
          {payload.relatedItems.map((item) => (
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5" key={item.slug}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-stone-50">{item.name}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-300/76">{item.description}</p>
                </div>
                <p className="text-sm font-semibold text-amber-100">
                  {formatCurrency(item.priceInPaise, restaurant.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
