"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateRestaurantInfo } from "@/server/actions/settings";

interface Props {
  restaurant: {
    name: string;
    tagline?: string | null;
    phone: string;
    email: string;
    addressLine1: string;
    city: string;
  };
}

const inputStyle = {
  background: "oklch(12% 0.018 36)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
};

export function RestaurantInfoForm({ restaurant }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateRestaurantInfo(fd);
      if (result.success) setSaved(true);
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { label: "Restaurant name", name: "name", defaultValue: restaurant.name },
          { label: "Tagline", name: "tagline", defaultValue: restaurant.tagline ?? "" },
          { label: "Phone", name: "phone", defaultValue: restaurant.phone },
          { label: "Email", name: "email", defaultValue: restaurant.email },
          { label: "Address", name: "addressLine1", defaultValue: restaurant.addressLine1 },
          { label: "City", name: "city", defaultValue: restaurant.city },
        ].map(({ label, name, defaultValue }) => (
          <div key={name}>
            <label className="text-xs" style={{ color: "var(--muted)" }}>{label}</label>
            <input
              name={name}
              defaultValue={defaultValue}
              className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
              style={inputStyle}
            />
          </div>
        ))}
      </div>
      {error && <p className="text-xs" style={{ color: "oklch(70% 0.2 25)" }}>{error}</p>}
      {saved && <p className="text-xs" style={{ color: "oklch(72% 0.19 145)" }}>Saved successfully.</p>}
      <Button size="sm" type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}
