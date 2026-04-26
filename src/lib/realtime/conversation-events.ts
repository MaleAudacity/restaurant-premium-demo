import { emitRealtimeEvent } from "@/lib/realtime/bus";

export function emitConversationMessageAppended(conversationId: string) {
  emitRealtimeEvent({
    type: "conversation.message.appended",
    entity: "conversation",
    entityId: conversationId,
  });
}
