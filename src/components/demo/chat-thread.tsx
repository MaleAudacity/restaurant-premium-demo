"use client";

import { useEffect, useRef } from "react";

import { DemoChatMessageBubble } from "@/components/demo/chat-message";
import { type DemoChatMessage } from "@/lib/demo/chat-types";

export function DemoChatThread({ messages }: { messages: DemoChatMessage[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    element.scrollTop = element.scrollHeight;
  }, [messages]);

  return (
    <div
      className="relative flex-1 overflow-y-auto px-3 py-4 md:px-5"
      ref={containerRef}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(0, 168, 132, 0.16), transparent 24%), radial-gradient(circle at 80% 10%, rgba(245, 158, 11, 0.1), transparent 20%), linear-gradient(180deg, rgba(17, 27, 33, 0.98), rgba(11, 20, 26, 0.98))",
        }}
      />
      <div className="relative space-y-3">
        {messages.map((message) => (
          <DemoChatMessageBubble key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
