"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "./category-form";
import { ItemForm } from "./item-form";
import { toggleCategoryActive, deleteCategory, toggleItemAvailability, deleteMenuItem } from "@/server/actions/menu";
import { formatCurrency } from "@/lib/utils";

interface Item {
  id: string;
  name: string;
  categoryId: string;
  description: string | null;
  priceInPaise: number;
  spiceLevel: number;
  isVegetarian: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  prepTimeMinutes: number | null;
  imageUrl: string | null;
  dietaryTags: string[];
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  items: Item[];
}

export function MenuManager({ categories }: { categories: Category[] }) {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(categories[0]?.id ?? null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedCat = categories.find((c) => c.id === selectedCatId) ?? null;

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    startTransition(async () => { await action(); });
  }

  const panelStyle = {
    background: "oklch(13% 0.02 36)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Category sidebar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-50">Categories</p>
          <Button size="sm" onClick={() => { setShowCatForm(true); setEditingCat(null); }}>+ Add</Button>
        </div>

        {(showCatForm || editingCat) && (
          <div className="rounded-2xl p-4" style={panelStyle}>
            <p className="mb-3 text-xs font-medium" style={{ color: "var(--muted)" }}>
              {editingCat ? "Edit category" : "New category"}
            </p>
            <CategoryForm
              category={editingCat ?? undefined}
              onDone={() => { setShowCatForm(false); setEditingCat(null); }}
            />
          </div>
        )}

        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition"
              style={{
                background: selectedCatId === cat.id ? "rgba(255,255,255,0.08)" : "transparent",
                border: selectedCatId === cat.id ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                color: cat.isActive ? "var(--foreground)" : "var(--muted)",
              }}
            >
              <span>{cat.name}</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>{cat.items.length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Items panel */}
      <div>
        {selectedCat ? (
          <div className="space-y-4">
            {/* Category header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-50">{selectedCat.name}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {selectedCat.items.length} item{selectedCat.items.length !== 1 ? "s" : ""} · Sort order {selectedCat.sortOrder}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingCat(selectedCat)}>Edit</Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => run(() => toggleCategoryActive(selectedCat.id, !selectedCat.isActive))}
                  style={{ color: selectedCat.isActive ? "oklch(70% 0.18 75)" : "oklch(72% 0.19 145)" }}
                >
                  {selectedCat.isActive ? "Hide" : "Show"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => run(() => deleteCategory(selectedCat.id))}
                  style={{ color: "oklch(70% 0.2 25)" }}
                >
                  Delete
                </Button>
                <Button size="sm" onClick={() => { setShowItemForm(true); setEditingItem(null); }}>+ Add item</Button>
              </div>
            </div>

            {(showItemForm || editingItem) && (
              <div className="rounded-2xl p-5" style={panelStyle}>
                <p className="mb-4 text-sm font-medium text-stone-50">
                  {editingItem ? `Edit: ${editingItem.name}` : "New menu item"}
                </p>
                <ItemForm
                  categories={categories}
                  item={editingItem ?? undefined}
                  defaultCategoryId={selectedCat.id}
                  onDone={() => { setShowItemForm(false); setEditingItem(null); }}
                />
              </div>
            )}

            {selectedCat.items.length === 0 && !showItemForm ? (
              <div className="rounded-2xl border border-dashed p-10 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                No items yet — click "+ Add item" to start
              </div>
            ) : (
              <div className="space-y-2">
                {selectedCat.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 rounded-2xl p-4" style={panelStyle}>
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-stone-50">{item.name}</p>
                        {item.isVegetarian && <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: "oklch(52% 0.19 145 / 0.2)", color: "oklch(72% 0.19 145)" }}>VEG</span>}
                        {item.isFeatured && <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: "oklch(74% 0.13 82 / 0.2)", color: "oklch(80% 0.13 82)" }}>FEATURED</span>}
                        {!item.isAvailable && <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: "oklch(60% 0.2 25 / 0.2)", color: "oklch(70% 0.2 25)" }}>UNAVAILABLE</span>}
                      </div>
                      <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{formatCurrency(item.priceInPaise)}</p>
                      {item.description && <p className="mt-0.5 text-xs truncate" style={{ color: "var(--muted)" }}>{item.description}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => { setEditingItem(item); setShowItemForm(false); }}>Edit</Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => run(() => toggleItemAvailability(item.id, !item.isAvailable))}
                        style={{ fontSize: "11px", color: item.isAvailable ? "oklch(70% 0.18 75)" : "oklch(72% 0.19 145)" }}
                      >
                        {item.isAvailable ? "86 item" : "Available"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => run(() => deleteMenuItem(item.id))}
                        style={{ fontSize: "11px", color: "oklch(70% 0.2 25)" }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-12 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            Select a category to manage items
          </div>
        )}
      </div>
    </div>
  );
}
