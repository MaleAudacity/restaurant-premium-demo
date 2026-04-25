"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const source = new EventSource("/api/events");
    source.onmessage = () => {
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
