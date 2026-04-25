import { getMenuManagementData } from "@/server/queries";
import { MenuManager } from "@/components/menu/menu-manager";
import { Card } from "@/components/ui/card";

export default async function MenuManagementPage() {
  const categories = await getMenuManagementData();

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl text-stone-50">Menu Management</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Add, edit, and manage categories and menu items. Changes go live immediately.
          </p>
        </div>
      </div>
      <MenuManager categories={categories} />
    </Card>
  );
}
