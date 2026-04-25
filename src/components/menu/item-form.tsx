"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createMenuItem, updateMenuItem } from "@/server/actions/menu";
import { formatCurrency } from "@/lib/utils";

interface Category { id: string; name: string }

interface Item {
  id: string;
  name: string;
  categoryId: string;
  description: string | null;
  priceInPaise: number;
  spiceLevel: number;
  isVegetarian: boolean;
  isFeatured: boolean;
  prepTimeMinutes: number | null;
  imageUrl: string | null;
  dietaryTags: string[];
}

interface Props {
  categories: Category[];
  item?: Item;
  defaultCategoryId?: string;
  onDone: () => void;
}

export function ItemForm({ categories, item, defaultCategoryId, onDone }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState(item ? String(item.priceInPaise / 100) : "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    // Convert rupees → paise
    const rupees = parseFloat(formData.get("priceRupees") as string);
    formData.set("priceInPaise", String(Math.round(rupees * 100)));
    formData.delete("priceRupees");

    startTransition(async () => {
      const result = item
        ? await updateMenuItem(item.id, formData)
        : await createMenuItem(formData);
      if (!result.success) setError(result.error);
      else onDone();
    });
  }

  const inputStyle = {
    background: "oklch(12% 0.018 36)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Name</label>
          <input name="name" required defaultValue={item?.name} className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Category</label>
          <select name="categoryId" required defaultValue={item?.categoryId ?? defaultCategoryId} className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Price (₹)</label>
          <input name="priceRupees" type="number" step="0.5" min="1" required
            value={price} onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Prep time (min)</label>
          <input name="prepTimeMinutes" type="number" min="1" max="120" defaultValue={item?.prepTimeMinutes ?? 15} className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Spice level (0–5)</label>
          <input name="spiceLevel" type="number" min="0" max="5" defaultValue={item?.spiceLevel ?? 0} className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Image URL</label>
          <input name="imageUrl" type="url" defaultValue={item?.imageUrl ?? ""} placeholder="https://…" className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
        </div>
      </div>

      <div>
        <label className="text-xs" style={{ color: "var(--muted)" }}>Description</label>
        <textarea name="description" rows={2} defaultValue={item?.description ?? ""} className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
      </div>

      <div>
        <label className="text-xs" style={{ color: "var(--muted)" }}>Dietary tags (comma-separated)</label>
        <input name="dietaryTags" defaultValue={item?.dietaryTags?.join(", ") ?? ""} placeholder="vegan, gluten-free, nut-free" className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
          <input name="isVegetarian" type="checkbox" defaultChecked={item?.isVegetarian} className="h-4 w-4 rounded" />
          Vegetarian
        </label>
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
          <input name="isFeatured" type="checkbox" defaultChecked={item?.isFeatured} className="h-4 w-4 rounded" />
          Featured on homepage
        </label>
      </div>

      {error && <p className="text-xs" style={{ color: "oklch(70% 0.2 25)" }}>{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button size="sm" type="submit" disabled={isPending}>{isPending ? "Saving…" : item ? "Save changes" : "Add item"}</Button>
        <Button size="sm" type="button" variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}
