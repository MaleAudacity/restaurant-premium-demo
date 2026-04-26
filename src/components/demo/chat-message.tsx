import { CheckCheck } from "lucide-react";

import { DemoChatSummaryCard } from "@/components/demo/chat-summary-card";
import { cn } from "@/lib/utils";
import { type DemoChatMessage } from "@/lib/demo/chat-types";

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
});

export function DemoChatMessageBubble({ message }: { message: DemoChatMessage }) {
  const timestamp = timeFormatter.format(new Date(message.createdAt));

  if (message.direction === "SYSTEM") {
    return (
      <div
        data-testid="chat-message"
        data-message-direction="SYSTEM"
        className="mx-auto max-w-[80%] rounded-full border border-white/10 bg-white/7 px-4 py-2 text-center text-[11px] uppercase tracking-[0.22em] text-stone-300/86"
      >
        {message.content}
      </div>
    );
  }

  const isInbound = message.direction === "INBOUND";
  const hasCard = Boolean(message.metadata?.card);

  return (
    <div
      data-testid="chat-message"
      data-message-direction={message.direction}
      className={cn("flex w-full", isInbound ? "justify-end" : "justify-start")}
    >
      <div className={cn("max-w-[86%] space-y-1", isInbound ? "items-end" : "items-start")}>
        {hasCard ? (
          <DemoChatSummaryCard card={message.metadata!.card!} />
        ) : (
          <div
            className={cn(
              "rounded-[24px] px-4 py-3 text-sm leading-6 shadow-[0_10px_30px_rgba(0,0,0,0.12)]",
              isInbound
                ? "rounded-br-md bg-[#005c4b] text-[#ecfff8]"
                : "rounded-bl-md border border-white/10 bg-[#202c33] text-stone-100",
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        )}
        <div
          className={cn(
            "flex items-center gap-1 px-1 text-[11px]",
            isInbound ? "justify-end text-emerald-100/70" : "justify-start text-stone-400",
          )}
        >
          <span>{timestamp}</span>
          {isInbound ? <CheckCheck className="h-3.5 w-3.5" /> : null}
        </div>
      </div>
    </div>
  );
}
