"use server";

import { revalidatePath } from "next/cache";

import { progressDemoChat, resetPrimaryDemoChat } from "@/lib/demo/chat-actions";

function refreshDemoChatSurface() {
  revalidatePath("/demo/chat");
  revalidatePath("/dashboard");
  revalidatePath("/orders");
  revalidatePath("/bookings");
  revalidatePath("/events");
}

export async function submitDemoChatMessageAction(formData: FormData) {
  await progressDemoChat({
    conversationId: formData.get("conversationId")?.toString(),
    value: formData.get("inputValue")?.toString() ?? "",
    quickReplyKey: formData.get("quickReplyKey")?.toString() ?? null,
  });

  refreshDemoChatSurface();
}

export async function resetDemoChatAction(formData: FormData) {
  await resetPrimaryDemoChat(formData.get("conversationId")?.toString());
  refreshDemoChatSurface();
}
