"use client";

import { useState, useEffect, useCallback } from "react";
import { CartContext, type CartItem } from "@/lib/cart";

const STORAGE_KEY = "mm_cart";

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable — silently ignore
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadFromStorage());
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    saveToStorage(next);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.slug === item.slug);
        const next = existing
          ? prev.map((i) =>
              i.slug === item.slug ? { ...i, quantity: i.quantity + 1 } : i
            )
          : [...prev, { ...item, quantity: 1 }];
        saveToStorage(next);
        return next;
      });
    },
    []
  );

  const removeItem = useCallback(
    (slug: string) => {
      const next = items.filter((i) => i.slug !== slug);
      persist(next);
    },
    [items, persist]
  );

  const updateQuantity = useCallback(
    (slug: string, quantity: number) => {
      if (quantity <= 0) {
        const next = items.filter((i) => i.slug !== slug);
        persist(next);
      } else {
        const next = items.map((i) =>
          i.slug === slug ? { ...i, quantity } : i
        );
        persist(next);
      }
    },
    [items, persist]
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotalInPaise = items.reduce(
    (s, i) => s + i.priceInPaise * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotalInPaise,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
