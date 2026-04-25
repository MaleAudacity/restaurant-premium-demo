import { MapPin, MessageCircleMore, Phone, RotateCcw, Send, Sparkles } from "lucide-react";

import { DemoChatQuickReplies } from "@/components/demo/chat-quick-replies";
import { DemoChatThread } from "@/components/demo/chat-thread";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hydrateFlowSummary } from "@/lib/demo/chat-engine";
import { resetDemoChatAction, submitDemoChatMessageAction } from "@/server/actions/demo-chat";
import { getDemoChatPageData } from "@/server/queries/demo-chat";

function humanizeStep(step: string) {
  return step.toLowerCase().replace(/_/g, " ");
}

export async function DemoChatPage() {
  const data = await getDemoChatPageData();

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-6">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(245,158,11,0.22),rgba(249,115,22,0.08))] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f59e0b,#f97316)] font-semibold text-stone-950">
                MM
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-amber-100/76">
                  WhatsApp Simulator
                </p>
                <h2 className="mt-1 font-serif text-3xl text-stone-50">Mirch Masala</h2>
              </div>
            </div>
          </div>
          <div className="space-y-5 p-6">
            <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Live conversation</p>
              <p className="mt-2 text-lg font-semibold text-stone-50">{data.customer.name}</p>
              <p className="mt-1 text-sm text-stone-300/80">{data.customer.phone}</p>
              {data.customer.notes ? (
                <p className="mt-3 text-sm leading-6 text-stone-300/72">{data.customer.notes}</p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Current flow</p>
                <p className="mt-2 text-base font-semibold text-stone-50">
                  {hydrateFlowSummary(data.currentFlow)}
                </p>
                <p className="mt-1 text-sm text-stone-300/72">{humanizeStep(data.currentStep)}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Conversation state</p>
                <p className="mt-2 text-sm leading-6 text-stone-200/88">{data.summary}</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">What this supports</p>
              <div className="mt-3 grid gap-2 text-sm text-stone-200/84">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Guided food ordering with pending payment state
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Table bookings, party inquiries, and event capture
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Menu browsing plus contact, timings, and location CTA
                </div>
              </div>
            </div>

            <form action={resetDemoChatAction}>
              <input name="conversationId" type="hidden" value={data.conversationId} />
              <Button className="w-full" type="submit" variant="secondary">
                <RotateCcw className="h-4 w-4" />
                Reset Conversation
              </Button>
            </form>

            {data.isReadonlyFallback ? (
              <div className="rounded-[22px] border border-amber-300/18 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-50/88">
                Database fallback mode is active, so this screen is read-only until PostgreSQL is reachable.
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.55),rgba(15,23,42,0.18))] p-4 md:p-6">
          <div className="mx-auto w-full max-w-[460px]">
            <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[#111b21] shadow-[0_30px_100px_rgba(0,0,0,0.4)]">
              <div className="flex justify-center bg-[#111b21] pt-3">
                <div className="h-1.5 w-20 rounded-full bg-white/12" />
              </div>

              <div className="sticky top-0 z-10 border-b border-white/6 bg-[#202c33]/95 px-4 py-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f59e0b,#f97316)] text-sm font-semibold text-stone-950">
                    {data.customer.name
                      .split(" ")
                      .map((part) => part[0] ?? "")
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-semibold text-white">{data.customer.name}</p>
                      <span className="rounded-full border border-emerald-300/18 bg-emerald-400/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                        Demo
                      </span>
                    </div>
                    <p className="truncate text-xs uppercase tracking-[0.22em] text-stone-300/76">
                      {data.customer.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300/82">
                    <Phone className="h-4 w-4" />
                    <MessageCircleMore className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <DemoChatThread messages={data.messages} />

              <div className="border-t border-white/6 bg-[#111b21] px-3 py-3 md:px-4">
                <DemoChatQuickReplies
                  action={submitDemoChatMessageAction}
                  conversationId={data.conversationId}
                  disabled={data.isReadonlyFallback}
                  prompt={data.activePrompt ?? undefined}
                />

                <form action={submitDemoChatMessageAction} className="mt-3">
                  <input name="conversationId" type="hidden" value={data.conversationId} />
                  <div className="flex items-center gap-2 rounded-[26px] border border-white/8 bg-[#202c33] px-2 py-2 shadow-inner shadow-black/25">
                    <Input
                      autoComplete="off"
                      className="h-11 border-0 bg-transparent px-3 shadow-none focus:ring-0"
                      defaultValue=""
                      disabled={data.isReadonlyFallback}
                      name="inputValue"
                      placeholder={data.activePrompt?.inputPlaceholder ?? "Reply in chat"}
                    />
                    <Button className="h-11 w-11 shrink-0 p-0" disabled={data.isReadonlyFallback} size="icon" type="submit">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-black/16 px-4 py-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-amber-300" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Restaurant</p>
                    <p className="mt-1 text-sm font-medium text-stone-50">{data.restaurant.name}</p>
                    <p className="mt-1 text-sm text-stone-300/72">{data.restaurant.whatsappNumber ?? data.restaurant.phone}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/16 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 text-amber-300" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Experience</p>
                    <p className="mt-1 text-sm font-medium text-stone-50">Premium guided WhatsApp flow</p>
                    <p className="mt-1 text-sm text-stone-300/72">
                      Database-backed messages, step state, and summary/status cards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
