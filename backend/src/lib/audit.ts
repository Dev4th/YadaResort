import { prisma } from './prisma';

type AuditInput = {
  userId?: string | null;
  action: string;
  tableName: string;
  recordId?: string | null;
  oldData?: unknown;
  newData?: unknown;
  ipAddress?: string | null;
};

export async function writeAuditLog({
  userId = null,
  action,
  tableName,
  recordId = null,
  oldData,
  newData,
  ipAddress = null,
}: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action,
        table_name: tableName,
        record_id: recordId,
        old_data: oldData === undefined ? undefined : (oldData as any),
        new_data: newData === undefined ? undefined : (newData as any),
        ip_address: ipAddress,
      },
    });
  } catch (error) {
    console.error('[Audit] Failed to write audit log:', error);
  }
}
