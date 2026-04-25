import { Card } from "@/components/ui/card";
import { getSettingsPageData } from "@/server/queries";
import { RestaurantInfoForm } from "@/components/settings/restaurant-info-form";
import { BusinessHoursForm } from "@/components/settings/business-hours-form";
import { DeliveryZonesManager } from "@/components/settings/delivery-zones-manager";

export default async function SettingsPage() {
  const { restaurant, users, businessHours, deliveryZones } = await getSettingsPageData();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Restaurant info */}
        <Card className="p-6">
          <h2 className="mb-5 font-serif text-3xl text-stone-50">Restaurant Info</h2>
          <RestaurantInfoForm restaurant={restaurant} />
        </Card>

        {/* Team */}
        <Card className="p-6">
          <h2 className="font-serif text-3xl text-stone-50">Team</h2>
          <div className="mt-5 space-y-3">
            {users.map((user) => (
              <div
                key={(user as { email?: string; name: string }).email ?? user.name}
                className="flex items-center justify-between rounded-[22px] border border-white/10 bg-black/20 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-stone-50">{user.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {(user as { title?: string | null }).title ?? ""}
                    {(user as { role?: string }).role ? ` · ${(user as { role?: string }).role}` : ""}
                  </p>
                </div>
                {(user as { isActive?: boolean }).isActive !== undefined && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px]"
                    style={{
                      background: (user as { isActive: boolean }).isActive ? "oklch(52% 0.19 145 / 0.15)" : "oklch(60% 0.2 25 / 0.15)",
                      color: (user as { isActive: boolean }).isActive ? "oklch(72% 0.19 145)" : "oklch(70% 0.2 25)",
                    }}
                  >
                    {(user as { isActive: boolean }).isActive ? "Active" : "Inactive"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Business hours */}
      <Card className="p-6">
        <h2 className="mb-5 font-serif text-3xl text-stone-50">Business Hours</h2>
        {businessHours.length > 0 ? (
          <BusinessHoursForm hours={businessHours} />
        ) : (
          <p className="text-sm" style={{ color: "var(--muted)" }}>No business hours configured.</p>
        )}
      </Card>

      {/* Delivery zones */}
      <Card className="p-6">
        <h2 className="mb-5 font-serif text-3xl text-stone-50">Delivery Zones</h2>
        <DeliveryZonesManager zones={deliveryZones} />
      </Card>
    </div>
  );
}
