"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createCategory, updateCategory } from "@/server/actions/menu";

interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

interface Props {
  category?: Category;
  onDone: () => void;
}

export function CategoryForm({ category, onDone }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = category
        ? await updateCategory(category.id, formData)
        : await createCategory(formData);
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
      <div>
        <label className="text-xs" style={{ color: "var(--muted)" }}>Category name</label>
        <input name="name" required defaultValue={category?.name} className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
      </div>
      <div>
        <label className="text-xs" style={{ color: "var(--muted)" }}>Description</label>
        <input name="description" defaultValue={category?.description ?? ""} className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
      </div>
      <div>
        <label className="text-xs" style={{ color: "var(--muted)" }}>Sort order</label>
        <input name="sortOrder" type="number" min="0" defaultValue={category?.sortOrder ?? 0} className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
      </div>
      {error && <p className="text-xs" style={{ color: "oklch(70% 0.2 25)" }}>{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button size="sm" type="submit" disabled={isPending}>{isPending ? "Saving…" : category ? "Save" : "Create"}</Button>
        <Button size="sm" type="button" variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}
