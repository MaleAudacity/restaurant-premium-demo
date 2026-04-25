"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

interface Props {
  slug: string;
  name: string;
  priceInPaise: number;
}

export function AddToCartButton({ slug, name, priceInPaise }: Props) {
  const { addItem, items } = useCart();
  const [flash, setFlash] = useState(false);

  const qty = items.find((i) => i.slug === slug)?.quantity ?? 0;

  function handleAdd() {
    addItem({ slug, name, priceInPaise });
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
  }

  return (
    <Button
      size="lg"
      onClick={handleAdd}
      style={
        flash
          ? { background: "oklch(52% 0.19 100 / 0.9)" }
          : undefined
      }
    >
      {flash ? "Added!" : qty > 0 ? `In cart (${qty})` : "Add to Cart"}
    </Button>
  );
}
