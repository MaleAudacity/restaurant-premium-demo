import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoUsers } from "@/lib/demo/demo-data";
import { loginAsRole } from "@/server/actions/auth";

export default function LoginPage() {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden border-amber-300/12 bg-[linear-gradient(135deg,rgba(245,158,11,0.16),rgba(15,23,42,0.62))] p-10">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.36em] text-amber-200/72">
              Mirch Masala
            </p>
            <div className="space-y-4">
              <h1 className="max-w-2xl font-serif text-5xl text-stone-50 md:text-6xl">
                Premium restaurant operations, ready for client demo.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-200/78">
                Switch roles instantly to review the dashboard, kitchen board, booking
                pipeline, and WhatsApp-style demo flows.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {["Website + Admin", "Kitchen + Control", "Seeded Demo Data"].map((item) => (
                <div
                  className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-sm text-stone-200/78"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 p-3 text-emerald-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-3xl text-stone-50">Demo Access</h2>
              <p className="text-sm text-stone-300/76">
                Choose a role to enter the seeded Mirch Masala environment.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {demoUsers.map((user) => (
              <form action={loginAsRole} className="rounded-[24px] border border-white/10 bg-white/5 p-4" key={user.role}>
                <input name="role" type="hidden" value={user.role} />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-stone-50">{user.title}</p>
                    <p className="text-sm text-stone-300/78">{user.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone-500">
                      {user.email}
                    </p>
                  </div>
                  <Button type="submit">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
