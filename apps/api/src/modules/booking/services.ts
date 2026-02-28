import { prisma } from "@/lib/prisma.js";

export function getServicesForTenant(tenantId: string) {
  return prisma.service.findMany({
    where: { tenantId, isActive: true },
    orderBy: { nameAr: "asc" },
  });
}

export function getDoctorsForService(tenantId: string, serviceId: string) {
  return prisma.doctor.findMany({
    where: {
      tenantId,
      isActive: true,
      services: { some: { id: serviceId } },
    },
    orderBy: { nameAr: "asc" },
  });
}
