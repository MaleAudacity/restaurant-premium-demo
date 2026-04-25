import { CalendarDays, CreditCard, MessageCircleMore, PartyPopper, Truck } from "lucide-react";

import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  approveOrderControlAction,
  completeBookingControlAction,
  confirmBookingControlAction,
  confirmEventControlAction,
  contactEventControlAction,
  createSampleBookingControlAction,
  createSampleEventControlAction,
  markDeliveredControlAction,
  markPreparingControlAction,
  markReadyControlAction,
  quoteEventControlAction,
  resetCurrentConversationAction,
  simulatePaymentFailureControlAction,
  simulatePaymentSuccessControlAction,
  startNewConversationAction,
} from "@/server/actions/demo-control-actions";
import { type DemoControlPageData } from "@/server/queries/demo-control";

function humanizeStep(step: string) {
  return step.toLowerCase().replaceAll("_", " ");
}

function prettyEventStatus(status: string) {
  return status === "PROPOSAL_SENT" ? "QUOTED" : status;
}

function prettyOrderStatus(status: string) {
  return status === "COMPLETED" ? "DELIVERED" : status;
}

function ActionForm({
  action,
  hiddenName,
  hiddenValue,
  label,
  disabled = false,
  variant = "secondary",
}: {
  action: (formData: FormData) => Promise<void>;
  hiddenName?: string;
  hiddenValue?: string | null;
  label: string;
  disabled?: boolean;
  variant?: "default" | "secondary" | "outline";
}) {
  return (
    <form action={action}>
      {hiddenName && hiddenValue ? <input name={hiddenName} type="hidden" value={hiddenValue} /> : null}
      <Button className="w-full justify-start" disabled={disabled} type="submit" variant={variant}>
        {label}
      </Button>
    </form>
  );
}

export function DemoControlPage({
  data,
}: {
  data: DemoControlPageData;
}) {
  const conversation = data.conversation;
  const order = data.currentOrder;
  const booking = data.currentBooking;
  const event = data.currentEvent;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Conversation</p>
          <p className="mt-3 font-serif text-4xl text-stone-50">{conversation ? 1 : 0}</p>
          <p className="mt-2 text-sm text-stone-300/76">
            Primary WhatsApp demo thread ready for manual simulation.
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Orders</p>
          <p className="mt-3 font-serif text-4xl text-stone-50">{data.counts.orders}</p>
          <p className="mt-2 text-sm text-stone-300/76">
            Payment, approval, kitchen, and delivery states.
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Bookings</p>
          <p className="mt-3 font-serif text-4xl text-stone-50">{data.counts.bookings}</p>
          <p className="mt-2 text-sm text-stone-300/76">
            Create or advance table-booking requests from the panel.
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Events</p>
          <p className="mt-3 font-serif text-4xl text-stone-50">{data.counts.events}</p>
          <p className="mt-2 text-sm text-stone-300/76">
            Event inquiries can be contacted, quoted, and confirmed.
          </p>
        </Card>
      </div>

      {data.isReadonlyFallback ? (
        <Card className="p-6">
          <h2 className="font-serif text-3xl text-stone-50">Database unavailable</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300/78">
            Start PostgreSQL and push the Prisma schema before using the demo control panel.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <MessageCircleMore className="mt-1 h-5 w-5 text-amber-300" />
            <div className="min-w-0">
              <h2 className="font-serif text-3xl text-stone-50">Chat simulation</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300/76">
                Control the current WhatsApp demo conversation and start a brand-new thread when you want a clean run.
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/18 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-semibold text-stone-50">{conversation?.customerName ?? "No conversation"}</p>
              {conversation ? <StatusBadge status={conversation.currentFlow} /> : null}
            </div>
            {conversation ? (
              <>
                <p className="mt-1 text-sm text-stone-300/78">{conversation.customerPhone}</p>
                <p className="mt-3 text-sm leading-6 text-stone-200/88">{conversation.summary}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-stone-400">
                  {humanizeStep(conversation.currentStep)} · {conversation.messageCount} messages
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-stone-300/76">The primary conversation will be created on demand.</p>
            )}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <ActionForm
              action={resetCurrentConversationAction}
              hiddenName="conversationId"
              hiddenValue={conversation?.id}
              label="Reset current conversation"
              variant="secondary"
            />
            <form action={startNewConversationAction}>
              <Button className="w-full justify-start" type="submit">
                Start new conversation
              </Button>
            </form>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <Truck className="mt-1 h-5 w-5 text-amber-300" />
            <div className="min-w-0">
              <h2 className="font-serif text-3xl text-stone-50">Order simulation</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300/76">
                Payments and order-status transitions append live message logs back into the chat thread.
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/18 p-4">
            {order ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-semibold text-stone-50">{order.orderNumber}</p>
                  <StatusBadge status={prettyOrderStatus(order.status)} />
                  <StatusBadge status={order.paymentStatus} />
                </div>
                <p className="text-sm text-stone-300/78">
                  {order.customer ? `${order.customer.firstName} ${order.customer.lastName ?? ""}`.trim() : "Guest"} ·{" "}
                  {formatCurrency(order.totalInPaise)}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
                  {order.orderType.replaceAll("_", " ")} · {formatDateTime(order.placedAt)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-stone-300/76">
                No order found yet. Create one from the chat flow first, then use these controls.
              </p>
            )}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <ActionForm action={simulatePaymentSuccessControlAction} hiddenName="orderId" hiddenValue={order?.id} label="Simulate payment success" disabled={!order} />
            <ActionForm action={simulatePaymentFailureControlAction} hiddenName="orderId" hiddenValue={order?.id} label="Simulate payment failure" disabled={!order} variant="outline" />
            <ActionForm action={approveOrderControlAction} hiddenName="orderId" hiddenValue={order?.id} label="Mark order approved" disabled={!order} />
            <ActionForm action={markPreparingControlAction} hiddenName="orderId" hiddenValue={order?.id} label="Mark preparing" disabled={!order} variant="secondary" />
            <ActionForm action={markReadyControlAction} hiddenName="orderId" hiddenValue={order?.id} label="Mark ready" disabled={!order} variant="secondary" />
            <ActionForm action={markDeliveredControlAction} hiddenName="orderId" hiddenValue={order?.id} label="Mark delivered" disabled={!order} variant="secondary" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-1 h-5 w-5 text-amber-300" />
            <div className="min-w-0">
              <h2 className="font-serif text-3xl text-stone-50">Booking simulation</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300/76">
                Create a sample booking request or move the latest booking from pending to confirmed and completed.
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/18 p-4">
            {booking ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-semibold text-stone-50">{booking.bookingReference}</p>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="text-sm text-stone-300/78">
                  {booking.guestCount} guests · {formatDateTime(booking.bookingDateTime)}
                </p>
                <p className="text-sm text-stone-300/72">{booking.seatingPreference ?? "No seating preference set"}</p>
              </div>
            ) : (
              <p className="text-sm text-stone-300/76">No booking request yet.</p>
            )}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <form action={createSampleBookingControlAction}>
              <Button className="w-full justify-start" type="submit">
                Create sample booking request
              </Button>
            </form>
            <ActionForm action={confirmBookingControlAction} hiddenName="bookingId" hiddenValue={booking?.id} label="Confirm booking" disabled={!booking} variant="secondary" />
            <ActionForm action={completeBookingControlAction} hiddenName="bookingId" hiddenValue={booking?.id} label="Complete booking" disabled={!booking} variant="secondary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <PartyPopper className="mt-1 h-5 w-5 text-amber-300" />
            <div className="min-w-0">
              <h2 className="font-serif text-3xl text-stone-50">Event simulation</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300/76">
                Create a fresh event inquiry and move it through contacted, quoted, and confirmed lifecycle stages.
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/18 p-4">
            {event ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-semibold text-stone-50">{event.inquiryReference}</p>
                  <StatusBadge status={prettyEventStatus(event.status)} />
                </div>
                <p className="text-sm text-stone-300/78">
                  {event.eventType} · {event.guestCount} guests
                </p>
                <p className="text-sm text-stone-300/72">{event.budgetRange ?? "Budget not set"}</p>
              </div>
            ) : (
              <p className="text-sm text-stone-300/76">No event inquiry yet.</p>
            )}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <form action={createSampleEventControlAction}>
              <Button className="w-full justify-start" type="submit">
                Create sample event inquiry
              </Button>
            </form>
            <ActionForm action={contactEventControlAction} hiddenName="eventId" hiddenValue={event?.id} label="Mark contacted" disabled={!event} variant="secondary" />
            <ActionForm action={quoteEventControlAction} hiddenName="eventId" hiddenValue={event?.id} label="Mark quoted" disabled={!event} variant="secondary" />
            <ActionForm action={confirmEventControlAction} hiddenName="eventId" hiddenValue={event?.id} label="Mark confirmed" disabled={!event} variant="secondary" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-1 h-5 w-5 text-amber-300" />
          <div>
            <h2 className="font-serif text-3xl text-stone-50">How this phase works</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-300/76">
              Chat completions now create real `Order`, `OrderItem`, `TableBooking`, and `EventInquiry` records. Payment
              and lifecycle buttons update those records in the database and append corresponding `MessageLog` entries so
              `/demo/chat` reflects the same operational story.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
