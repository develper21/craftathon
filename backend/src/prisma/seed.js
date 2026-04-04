const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    const hash = await bcrypt.hash("Password123!", 12);

    // Admin user
    const admin = await prisma.user.upsert({
        where: { email: "admin@medadherence.com" },
        update: {},
        create: {
            email: "admin@medadherence.com",
            passwordHash: hash,
            firstName: "Admin",
            lastName: "User",
            role: "ADMIN",
            isEmailVerified: true,
            profile: { create: {} },
        },
    });

    // Create streak for admin separately
    await prisma.streak.upsert({
        where: { userId: admin.id },
        update: {},
        create: { userId: admin.id },
    });

    // Demo patient
    const patient = await prisma.user.upsert({
        where: { email: "patient@demo.com" },
        update: {},
        create: {
            email: "patient@demo.com",
            passwordHash: hash,
            firstName: "Ravi",
            lastName: "Shah",
            role: "PATIENT",
            isEmailVerified: true,
            profile: {
                create: {
                    dateOfBirth: new Date("1990-05-15"),
                    bloodGroup: "O+",
                    conditions: ["Hypertension", "Diabetes"],
                    timezone: "Asia/Kolkata",
                },
            },
        },
    });

    // Create streak for patient separately
    await prisma.streak.upsert({
        where: { userId: patient.id },
        update: {},
        create: { userId: patient.id },
    });

    // Demo caregiver
    const caregiver = await prisma.user.upsert({
        where: { email: "caregiver@demo.com" },
        update: {},
        create: {
            email: "caregiver@demo.com",
            passwordHash: hash,
            firstName: "Priya",
            lastName: "Shah",
            role: "CAREGIVER",
            isEmailVerified: true,
            profile: { create: {} },
        },
    });

    // Create streak for caregiver separately
    await prisma.streak.upsert({
        where: { userId: caregiver.id },
        update: {},
        create: { userId: caregiver.id },
    });

    // Link caregiver to patient (auto-accepted)
    await prisma.caregiverLink.upsert({
        where: { caregiverId_patientId: { caregiverId: caregiver.id, patientId: patient.id } },
        update: {},
        create: { caregiverId: caregiver.id, patientId: patient.id, isAccepted: true },
    });

    // Demo medications
    const med1 = await prisma.medication.upsert({
        where: { id: "demo-med-1" },
        update: {},
        create: {
            id: "demo-med-1",
            userId: patient.id,
            name: "Metformin",
            dosage: "500mg",
            frequency: "TWICE_DAILY",
            times: ["08:00", "20:00"],
            startDate: new Date(),
            instructions: "Take after meals",
            color: "#4F46E5",
        },
    }).catch(() => prisma.medication.findFirst({ where: { userId: patient.id, name: "Metformin" } }));

    const med2 = await prisma.medication.upsert({
        where: { id: "demo-med-2" },
        update: {},
        create: {
            id: "demo-med-2",
            userId: patient.id,
            name: "Amlodipine",
            dosage: "5mg",
            frequency: "DAILY",
            times: ["09:00"],
            startDate: new Date(),
            instructions: "Take in the morning",
            color: "#059669",
        },
    }).catch(() => prisma.medication.findFirst({ where: { userId: patient.id, name: "Amlodipine" } }));

    console.log("Seed completed!");
    console.log("─────────────────────────────────────────");
    console.log("Admin:     admin@medadherence.com");
    console.log("Patient:   patient@demo.com");
    console.log("Caregiver: caregiver@demo.com");
    console.log("🔑 Password (all): Password123!");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
