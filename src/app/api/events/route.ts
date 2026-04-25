import { subscribeRealtime } from "@/lib/realtime/bus";

export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

export async function GET() {
  let unsubscribe: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`),
      );

      unsubscribe = subscribeRealtime((event) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      });
    },
    cancel() {
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
