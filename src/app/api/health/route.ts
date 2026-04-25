import { NextResponse } from "next/server";
import { isDatabaseReachable } from "@/lib/database-status";

export const dynamic = "force-dynamic";

const startedAt = Date.now();

export async function GET() {
  const dbOk = await isDatabaseReachable();

  const payload = {
    status: dbOk ? "ok" : "degraded",
    db: dbOk ? "reachable" : "unreachable",
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "unknown",
  };

  return NextResponse.json(payload, { status: dbOk ? 200 : 503 });
}
