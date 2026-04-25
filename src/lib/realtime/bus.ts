import { EventEmitter } from "node:events";

export type RealtimeEvent = {
  type: string;
  entity?: string;
  entityId?: string;
  timestamp: number;
};

declare global {
  var realtimeBus: EventEmitter | undefined;
}

const bus = globalThis.realtimeBus ?? new EventEmitter();
bus.setMaxListeners(100);

if (!globalThis.realtimeBus) {
  globalThis.realtimeBus = bus;
}

export function emitRealtimeEvent(event: Omit<RealtimeEvent, "timestamp">) {
  bus.emit("message", {
    ...event,
    timestamp: Date.now(),
  } satisfies RealtimeEvent);
}

export function subscribeRealtime(listener: (event: RealtimeEvent) => void) {
  bus.on("message", listener);

  return () => {
    bus.off("message", listener);
  };
}
