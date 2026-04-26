"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const source = new EventSource("/api/events");
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === "connected") return;
      } catch {
        // ignore parse errors and refresh anyway
      }
      startTransition(() => {
        router.refresh();
      });
    };

    return () => {
      source.close();
    };
  }, [router]);

  return null;
}
