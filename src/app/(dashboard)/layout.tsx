import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireDemoSession } from "@/lib/demo/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireDemoSession();

  return (
    <DashboardShell
      title="Operations Console"
      subtitle="Run service, bookings, events, kitchen, and demo workflows from one premium control surface."
      user={session}
    >
      {children}
    </DashboardShell>
  );
}
