/**
 * Seed script — creates a demo clinic with 2 doctors, services, and schedules.
 * Run: npm run db:seed -w @clinic-bot/api
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Tenant (clinic) ──────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { phoneNumberId: "DEMO_PHONE_NUMBER_ID" },
    update: {},
    create: {
      name: "عيادة الرعاية",
      phoneNumberId: "DEMO_PHONE_NUMBER_ID", // replace with real Meta phone_number_id
      wabaId: "DEMO_WABA_ID",
      accessToken: "DEMO_ACCESS_TOKEN",
      timezone: "Asia/Riyadh",
      locale: "AR",
      subscriptionTier: "GROWTH",
    },
  });
  console.log(`✅ Tenant: ${tenant.name} (${tenant.id})`);

  // ── Doctors ──────────────────────────────────────────────────────────────────
  const drAhmed = await prisma.doctor.upsert({
    where: { id: "dr_ahmed_001" },
    update: {},
    create: {
      id: "dr_ahmed_001",
      tenantId: tenant.id,
      nameAr: "د. أحمد الشمري",
      nameEn: "Dr. Ahmed Al-Shamri",
      specialty: "طب الأسنان",
      isActive: true,
    },
  });

  const drSarah = await prisma.doctor.upsert({
    where: { id: "dr_sarah_002" },
    update: {},
    create: {
      id: "dr_sarah_002",
      tenantId: tenant.id,
      nameAr: "د. سارة العتيبي",
      nameEn: "Dr. Sarah Al-Otaibi",
      specialty: "تجميل وليزر",
      isActive: true,
    },
  });
  console.log(`✅ Doctors: ${drAhmed.nameAr}, ${drSarah.nameAr}`);

  // ── Services ─────────────────────────────────────────────────────────────────
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: "svc_checkup" },
      update: {},
      create: {
        id: "svc_checkup",
        tenantId: tenant.id,
        doctorId: drAhmed.id,
        nameAr: "كشف عام",
        nameEn: "General Checkup",
        durationMinutes: 30,
        price: 150,
      },
    }),
    prisma.service.upsert({
      where: { id: "svc_cleaning" },
      update: {},
      create: {
        id: "svc_cleaning",
        tenantId: tenant.id,
        doctorId: drAhmed.id,
        nameAr: "تنظيف الأسنان",
        nameEn: "Teeth Cleaning",
        durationMinutes: 45,
        price: 200,
      },
    }),
    prisma.service.upsert({
      where: { id: "svc_laser" },
      update: {},
      create: {
        id: "svc_laser",
        tenantId: tenant.id,
        doctorId: drSarah.id,
        nameAr: "جلسة ليزر",
        nameEn: "Laser Session",
        durationMinutes: 60,
        price: 500,
      },
    }),
  ]);
  console.log(`✅ Services: ${services.map((s) => s.nameAr).join(", ")}`);

  // ── Schedules (Sun–Thu, 9am–5pm, break 1–2pm) ─────────────────────────────
  const workDays = [0, 1, 2, 3, 4]; // Sun=0, Mon=1, Tue=2, Wed=3, Thu=4

  for (const doctor of [drAhmed, drSarah]) {
    for (const day of workDays) {
      await prisma.schedule.upsert({
        where: { doctorId_dayOfWeek: { doctorId: doctor.id, dayOfWeek: day } },
        update: {},
        create: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          breakStart: "13:00",
          breakEnd: "14:00",
          isActive: true,
        },
      });
    }
  }
  console.log(`✅ Schedules: Sun–Thu 9am–5pm for both doctors`);

  console.log("\n🎉 Seed complete!");
  console.log(`\n📋 Tenant ID (use as VITE_TENANT_ID): ${tenant.id}`);
  console.log(
    `\n⚠️  Update tenant phoneNumberId, wabaId, and accessToken with real Meta values before testing WhatsApp.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
