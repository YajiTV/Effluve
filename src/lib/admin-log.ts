import { prisma } from "@/lib/prisma";

export async function createAdminLog(params: {
  adminId: number;
  action: string;
  target?: string;
  details?: string;
}) {
  await prisma.adminLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      target: params.target ?? null,
      details: params.details ?? null,
    },
  }).catch(() => null); // Ne jamais faire échouer la requête principale
}

export async function getAdminLogs(limit = 100) {
  return prisma.adminLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { fullName: true, email: true } } },
  });
}
