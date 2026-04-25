import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { getAnalyticsPageData } from "@/server/queries";
import { formatCurrency } from "@/lib/utils";

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsPageData();

  const maxDaily = Math.max(...analytics.dailyRevenue.map((d) => d.revenueInPaise), 1);
  const maxItems = Math.max(...analytics.topItems.map((i) => i.quantity), 1);

  const panelStyle = {
    background: "oklch(13% 0.02 36)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(analytics.totalRevenue)} hint="All time" />
        <StatCard label="Total Orders" value={String(analytics.totalOrders)} hint="All time" />
        <StatCard label="Avg Order Value" value={formatCurrency(analytics.averageOrderValue)} hint="All time" />
        <StatCard label="Total Customers" value={String(analytics.totalCustomers)} hint="Registered" />
      </div>

      {/* Revenue chart */}
      <Card className="p-6">
        <h2 className="font-serif text-2xl text-stone-50">Daily Revenue — Last 30 Days</h2>
        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
          {formatCurrency(analytics.dailyRevenue.reduce((s, d) => s + d.revenueInPaise, 0))} total this period
        </p>
        <div className="mt-6 flex items-end gap-[2px] h-40">
          {analytics.dailyRevenue.map((d) => {
            const pct = maxDaily > 0 ? (d.revenueInPaise / maxDaily) * 100 : 0;
            const label = d.date.slice(5);
            return (
              <div key={d.date} className="group relative flex flex-col items-center flex-1">
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${Math.max(pct, d.revenueInPaise > 0 ? 3 : 0)}%`,
                    background: d.revenueInPaise > 0 ? "oklch(52% 0.19 26 / 0.8)" : "rgba(255,255,255,0.05)",
                    minHeight: d.revenueInPaise > 0 ? "3px" : "2px",
                  }}
                />
                {d.revenueInPaise > 0 && (
                  <div
                    className="absolute bottom-full mb-2 hidden group-hover:block z-10 rounded-xl px-2 py-1 text-xs whitespace-nowrap pointer-events-none"
                    style={{ background: "oklch(18% 0.02 36)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  >
                    {label}: {formatCurrency(d.revenueInPaise)} · {d.orders} order{d.orders !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px]" style={{ color: "var(--muted)" }}>
          <span>{analytics.dailyRevenue[0]?.date.slice(5)}</span>
          <span>{analytics.dailyRevenue[14]?.date.slice(5)}</span>
          <span>{analytics.dailyRevenue[29]?.date.slice(5)}</span>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Top items */}
        <Card className="p-6">
          <h2 className="font-serif text-2xl text-stone-50">Top Menu Items</h2>
          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>By quantity ordered (last 30 days)</p>
          {analytics.topItems.length === 0 ? (
            <p className="mt-6 text-sm" style={{ color: "var(--muted)" }}>No orders yet.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {analytics.topItems.map((item) => {
                const pct = (item.quantity / maxItems) * 100;
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate" style={{ color: "var(--foreground)" }}>{item.name}</span>
                      <span className="ml-4 shrink-0 text-xs" style={{ color: "var(--muted)" }}>
                        {item.quantity}× · {formatCurrency(item.revenueInPaise)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "oklch(52% 0.19 26 / 0.7)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Status breakdown */}
        <Card className="p-6">
          <h2 className="font-serif text-2xl text-stone-50">Order Status Breakdown</h2>
          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>All time · {analytics.totalOrders} total</p>
          <div className="mt-5 space-y-3">
            {Object.entries(analytics.statusBreakdown).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
              const pct = analytics.totalOrders > 0 ? (count / analytics.totalOrders) * 100 : 0;
              const color = status === "COMPLETED" ? "oklch(52% 0.19 145 / 0.7)"
                : status === "CANCELLED" || status === "REJECTED" ? "oklch(52% 0.19 25 / 0.7)"
                : status === "PENDING" ? "oklch(52% 0.19 230 / 0.7)"
                : "oklch(52% 0.19 82 / 0.7)";
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: "var(--foreground)" }}>{status.replace(/_/g, " ")}</span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-3 text-center" style={panelStyle}>
              <p className="text-xl font-semibold text-stone-50">{analytics.completedOrders}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Completed</p>
            </div>
            <div className="rounded-2xl p-3 text-center" style={panelStyle}>
              <p className="text-xl font-semibold text-stone-50">
                {analytics.totalOrders > 0 ? `${Math.round((analytics.completedOrders / analytics.totalOrders) * 100)}%` : "—"}
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Completion rate</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
