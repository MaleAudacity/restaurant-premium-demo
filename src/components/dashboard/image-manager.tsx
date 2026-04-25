"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, CheckCircle, AlertCircle, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import type { MenuCategory, MenuItem } from "@/data/menu-data";

type UploadState = "idle" | "uploading" | "done" | "error";

interface ItemState {
  previewUrl: string | null;
  status: UploadState;
  error?: string;
}

export function ImageManager({ categories }: { categories: MenuCategory[] }) {
  const [states, setStates] = useState<Record<string, ItemState>>({
    hero: { previewUrl: "/images/hero/hero.jpg?t=0", status: "idle" },
  });

  const updateState = (id: string, patch: Partial<ItemState>) =>
    setStates((prev) => ({ ...prev, [id]: { ...prev[id], previewUrl: prev[id]?.previewUrl ?? null, status: "idle", ...patch } }));

  return (
    <div className="space-y-10">
      {/* Hero image */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-serif text-xl text-stone-100">Hero Image</h2>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-stone-400">Homepage banner</span>
        </div>
        <HeroImageCard
          state={states["hero"] ?? { previewUrl: null, status: "idle" }}
          onStateChange={(patch) => updateState("hero", patch)}
        />
      </section>

      {categories.map((cat) => (
        <section key={cat.slug}>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-serif text-xl text-stone-100">{cat.name}</h2>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-stone-400">
              {cat.items.length} dishes
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cat.items.map((item) => (
              <DishImageCard
                key={item.id}
                item={item}
                state={states[item.id] ?? { previewUrl: null, status: "idle" }}
                onStateChange={(patch) => updateState(item.id, patch)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function DishImageCard({
  item,
  state,
  onStateChange,
}: {
  item: MenuItem;
  state: ItemState;
  onStateChange: (patch: Partial<ItemState>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      onStateChange({ status: "uploading", previewUrl: URL.createObjectURL(file) });

      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", item.categorySlug.replace("signature-starters", "starters").replace("tandoor-grill", "grill").replace("royal-curries", "curries").replace("biryani-atelier", "biryani").replace("breads-sides", "sides").replace("desserts-pour", "desserts"));
      fd.append("slug", item.slug);

      try {
        const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        // Use the server path so the image persists after refresh
        onStateChange({ status: "done", previewUrl: data.path + "?t=" + Date.now() });
      } catch (err) {
        onStateChange({ status: "error", error: err instanceof Error ? err.message : "Upload failed" });
      }
    },
    [item, onStateChange],
  );

  const handleFiles = (files: FileList | null) => {
    if (files?.[0]) upload(files[0]);
  };

  const displaySrc = state.previewUrl ?? item.imagePath;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 ${
        dragging
          ? "border-amber-400/60 bg-amber-400/5 scale-[1.02]"
          : state.status === "done"
            ? "border-emerald-500/40 bg-white/5"
            : state.status === "error"
              ? "border-red-500/40 bg-white/5"
              : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
    >
      {/* Image preview */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/30">
        {state.previewUrl ? (
          <Image alt={item.name} className="object-cover" fill sizes="200px" src={state.previewUrl} unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-stone-600" />
          </div>
        )}

        {/* Upload overlay on hover */}
        <button
          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => inputRef.current?.click()}
        >
          {state.status === "uploading" ? (
            <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
          ) : (
            <>
              <Upload className="h-5 w-5 text-amber-400" />
              <span className="text-xs font-medium text-amber-300">
                {state.status === "done" ? "Replace" : "Upload"}
              </span>
            </>
          )}
        </button>

        {/* Status badge */}
        {state.status === "done" && (
          <div className="absolute right-2 top-2 rounded-full bg-emerald-500/90 p-1">
            <CheckCircle className="h-3.5 w-3.5 text-white" />
          </div>
        )}
        {state.status === "error" && (
          <div className="absolute right-2 top-2 rounded-full bg-red-500/90 p-1">
            <AlertCircle className="h-3.5 w-3.5 text-white" />
          </div>
        )}
      </div>

      {/* Dish name */}
      <div className="px-3 py-2">
        <p className="truncate text-xs font-medium text-stone-200">{item.name}</p>
        {state.status === "error" && (
          <p className="mt-0.5 truncate text-[10px] text-red-400">{state.error}</p>
        )}
        {state.status === "done" && (
          <p className="mt-0.5 text-[10px] text-emerald-400">Live ✓</p>
        )}
      </div>

      <input
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}

function HeroImageCard({ state, onStateChange }: { state: ItemState; onStateChange: (patch: Partial<ItemState>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const upload = useCallback(async (file: File) => {
    onStateChange({ status: "uploading", previewUrl: URL.createObjectURL(file) });
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", "hero");
    fd.append("slug", "hero");
    try {
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onStateChange({ status: "done", previewUrl: data.path + "?t=" + Date.now() });
    } catch (err) {
      onStateChange({ status: "error", error: err instanceof Error ? err.message : "Upload failed" });
    }
  }, [onStateChange]);

  const handleFiles = (files: FileList | null) => { if (files?.[0]) upload(files[0]); };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 ${
        dragging ? "border-amber-400/60 bg-amber-400/5 scale-[1.01]"
        : state.status === "done" ? "border-emerald-500/40 bg-white/5"
        : state.status === "error" ? "border-red-500/40 bg-white/5"
        : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
    >
      {/* Banner image area */}
      <div className="relative h-52 w-full overflow-hidden bg-black/30 sm:h-64">
        {state.previewUrl ? (
          <Image alt="Hero" className="object-cover" fill sizes="100vw" src={state.previewUrl} unoptimized onError={() => onStateChange({ previewUrl: null })} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <ImageIcon className="h-10 w-10 text-stone-600" />
            <p className="text-xs text-stone-500">No hero image uploaded</p>
          </div>
        )}
        <button
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => inputRef.current?.click()}
        >
          {state.status === "uploading" ? (
            <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">{state.status === "done" ? "Replace hero image" : "Upload hero image"}</span>
              <span className="text-xs text-stone-400">JPG, PNG, WebP · Recommended 1600×500px</span>
            </>
          )}
        </button>
        {state.status === "done" && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1">
            <CheckCircle className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-medium text-white">Live ✓</span>
          </div>
        )}
        {state.status === "error" && (
          <div className="absolute right-3 top-3 rounded-full bg-red-500/90 px-3 py-1 text-xs text-white">{state.error}</div>
        )}
      </div>
      <input accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={(e) => handleFiles(e.target.files)} ref={inputRef} type="file" />
    </div>
  );
}
