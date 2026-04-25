import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ChatMessageMetadata } from "@/lib/demo/chat-types";

function getButtonVariant(emphasis?: "primary" | "secondary" | "success" | "muted") {
  if (emphasis === "primary") {
    return "default";
  }

  if (emphasis === "success") {
    return "outline";
  }

  return "secondary";
}

export function DemoChatQuickReplies({
  action,
  conversationId,
  prompt,
  disabled = false,
}: {
  action: (formData: FormData) => Promise<void>;
  conversationId: string;
  prompt: ChatMessageMetadata["prompt"];
  disabled?: boolean;
}) {
  if (!prompt?.options.length) {
    return null;
  }

  const listStyle = prompt.presentation === "list";

  return (
    <div className="space-y-2">
      <div className={cn("flex flex-wrap gap-2", listStyle && "grid gap-2")}>
        {prompt.options.map((option) => (
          <form action={action} className={listStyle ? "w-full" : undefined} key={option.key}>
            <input name="conversationId" type="hidden" value={conversationId} />
            <input name="inputValue" type="hidden" value={option.label} />
            <input name="quickReplyKey" type="hidden" value={option.key} />
            <Button
              className={cn(
                "h-auto rounded-[18px] px-4 py-3 text-left",
                listStyle
                  ? "w-full justify-between"
                  : "bg-white/7 text-stone-100 hover:bg-white/12",
              )}
              disabled={disabled}
              type="submit"
              variant={getButtonVariant(option.emphasis)}
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium">{option.label}</span>
                {option.description ? (
                  <span className="mt-1 block text-xs leading-5 text-current/72">
                    {option.description}
                  </span>
                ) : null}
              </span>
              {listStyle ? <ArrowRight className="h-4 w-4 shrink-0" /> : null}
            </Button>
          </form>
        ))}
      </div>
      {prompt.helpText ? (
        <p className="text-xs leading-5 text-stone-400">{prompt.helpText}</p>
      ) : null}
    </div>
  );
}
