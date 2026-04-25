import { prisma } from "@/lib/prisma";

interface AuditParams {
  restaurantId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export async function writeAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        restaurantId: params.restaurantId,
        userId: params.userId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        description: params.description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: (params.metadata as any) ?? undefined,
      },
    });
  } catch (err) {
    // Audit failure must never crash the calling action.
    console.error("[audit] Failed to write audit log", { params, err });
  }
}
