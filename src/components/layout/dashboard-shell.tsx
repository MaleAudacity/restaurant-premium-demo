import Link from "next/link";
import { LogOut, MenuSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dashboardNavigation, type UserRole } from "@/lib/constants";
import { getInitials } from "@/lib/utils";

type SessionUser = {
  name: string;
  role: string;
  email: string;
};

export function DashboardShell({
  user,
  title,
  subtitle,
  children,
  headerActions,
}: {
  user: SessionUser;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}) {
  return (
    <div className="app-shell min-h-screen bg-transparent">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 md:grid-cols-[280px_minmax(0,1fr)] md:px-6">
        <aside className="rounded-[32px] border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/6 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f59e0b,#f97316)] font-semibold text-stone-950">
              M
            </div>
            <div>
              <p className="font-serif text-2xl leading-none text-stone-50">Mirch Masala</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-amber-200/70">
                Ops Console
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {dashboardNavigation
              .filter(({ allowedRoles }) => allowedRoles.includes(user.role as UserRole))
              .map(({ href, label, icon: Icon }) => (
                <Link
                  className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-stone-300 transition hover:border-white/10 hover:bg-white/6 hover:text-stone-50"
                  href={href}
                  key={href}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            {(user.role === "OWNER" || user.role === "MANAGER") && (
              <Link
                className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-stone-300 transition hover:border-white/10 hover:bg-white/6 hover:text-stone-50"
                href="/demo/control"
              >
                <MenuSquare className="h-4 w-4" />
                Demo Control
              </Link>
            )}
          </div>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-stone-50">
                {getInitials(user.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-50">{user.name}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                  {user.role}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-stone-300/80">{user.email}</p>
            <Button asChild className="mt-4 w-full" variant="secondary">
              <Link href="/login">
                <LogOut className="h-4 w-4" />
                Switch role
              </Link>
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <header className="rounded-[32px] border border-white/10 bg-black/20 px-6 py-5 backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.34em] text-amber-200/72">
                  Mirch Masala Control Room
                </p>
                <div>
                  <h1 className="font-serif text-4xl text-stone-50">{title}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300/78">
                    {subtitle}
                  </p>
                </div>
              </div>
              {headerActions ? <div className="flex flex-wrap gap-3">{headerActions}</div> : null}
            </div>
          </header>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
