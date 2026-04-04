const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const { sendSuccess, sendCreated } = require("../utils/apiResponse");
const { generateDoseSchedule, startOfDay } = require("../utils/scheduleHelper");

// ─── Create Medication ────────────────────────────────────────────────────────
const createMedication = async (req, res, next) => {
    try {
        const {
            name, brandName, dosage, unit, frequency, customDays,
            times, startDate, endDate, instructions,
            refillDate, totalQuantity, color,
        } = req.body;

        // If no startDate provided, default to today
        const medicationStartDate = startDate ? new Date(startDate) : new Date();
        medicationStartDate.setUTCHours(0, 0, 0, 0);

        const medication = await prisma.medication.create({
            data: {
                userId: req.user.id,
                name, brandName, dosage,
                unit: unit || "mg",
                frequency,
                customDays: customDays || [],
                times: times || [],
                startDate: medicationStartDate,
                endDate: endDate ? new Date(endDate) : null,
                instructions, refillDate: refillDate ? new Date(refillDate) : null,
                totalQuantity: totalQuantity || null,
                remainingQty: totalQuantity || null,
                color,
            },
        });

        // Get user's timezone
        const userProfile = await prisma.profile.findUnique({
            where: { userId: req.user.id },
            select: { timezone: true }
        });
        const userTimezone = userProfile?.timezone || "UTC";

        // Log timezone info
        const logger = require("../utils/logger");
        logger.info(`[MEDICATION] User Timezone: ${userTimezone}`);

        // Generate dose schedules for next 7 days with timezone
        await generateFutureDoseSchedules(medication, 7, userTimezone);

        // Log successful creation with start date
        logger.info(`[MEDICATION] Created: ${medication.name} (${medication.dosage}) | StartDate: ${medication.startDate.toISOString().split("T")[0]} | LOCAL Times: ${times?.join(", ") || "none"} | Timezone: ${userTimezone} | User: ${req.user.id}`);

        sendCreated(res, { medication }, "Medication added successfully.");
    } catch (err) {
        next(err);
    }
};

// ─── Get All Medications ──────────────────────────────────────────────────────
const getMedications = async (req, res, next) => {
    try {
        const { isActive } = req.query;
        const where = {
            userId: req.user.id,
            ...(isActive !== undefined && { isActive: isActive === "true" }),
        };

        const medications = await prisma.medication.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        sendSuccess(res, { medications, total: medications.length });
    } catch (err) {
        next(err);
    }
};

// ─── Get Single Medication ────────────────────────────────────────────────────
const getMedication = async (req, res, next) => {
    try {
        const medication = await prisma.medication.findFirst({
            where: { id: req.params.id, userId: req.user.id },
            include: {
                doseSchedules: {
                    orderBy: { scheduledAt: "desc" },
                    take: 10,
                },
            },
        });
        if (!medication) throw new AppError("Medication not found.", 404);
        sendSuccess(res, { medication });
    } catch (err) {
        next(err);
    }
};

// ─── Update Medication ────────────────────────────────────────────────────────
const updateMedication = async (req, res, next) => {
    try {
        const existing = await prisma.medication.findFirst({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!existing) throw new AppError("Medication not found.", 404);

        const allowedFields = [
            "name", "brandName", "dosage", "unit", "frequency", "customDays", "times",
            "startDate", "endDate", "instructions", "refillDate", "totalQuantity", "remainingQty", "color", "isActive",
        ];
        const updateData = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                if (["startDate", "endDate", "refillDate"].includes(field) && req.body[field]) {
                    updateData[field] = new Date(req.body[field]);
                } else {
                    updateData[field] = req.body[field];
                }
            }
        }

        const medication = await prisma.medication.update({
            where: { id: req.params.id },
            data: updateData,
        });

        // Regenerate upcoming schedules if timing changed
        if (req.body.times || req.body.frequency || req.body.customDays) {
            await prisma.doseSchedule.deleteMany({
                where: { medicationId: medication.id, scheduledAt: { gte: new Date() }, status: "PENDING" },
            });
            await generateFutureDoseSchedules(medication, 7);
        }

        sendSuccess(res, { medication }, "Medication updated.");
    } catch (err) {
        next(err);
    }
};

// ─── Delete (deactivate) Medication ──────────────────────────────────────────
const deleteMedication = async (req, res, next) => {
    try {
        const existing = await prisma.medication.findFirst({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!existing) throw new AppError("Medication not found.", 404);

        await prisma.medication.update({
            where: { id: req.params.id },
            data: { isActive: false },
        });
        sendSuccess(res, {}, "Medication deactivated.");
    } catch (err) {
        next(err);
    }
};

// ─── Today's Schedule ─────────────────────────────────────────────────────────
const getTodaySchedule = async (req, res, next) => {
    try {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setUTCHours(23, 59, 59, 999);

        const schedules = await prisma.doseSchedule.findMany({
            where: {
                userId: req.user.id,
                scheduledAt: { gte: todayStart, lte: todayEnd },
            },
            include: {
                medication: { select: { id: true, name: true, dosage: true, color: true, instructions: true, times: true } },
                doseLog: true,
            },
            orderBy: { scheduledAt: "asc" },
        });

        // Get user's timezone for display purposes
        const userProfile = await prisma.profile.findUnique({
            where: { userId: req.user.id },
            select: { timezone: true }
        });
        const userTimezone = userProfile?.timezone || "UTC";

        // Add formatted local time to each schedule for display
        const enrichedSchedules = schedules.map(schedule => {
            // Find the matching local time from medication.times
            const scheduledHour = schedule.scheduledAt.getUTCHours();
            const scheduledMinute = schedule.scheduledAt.getUTCMinutes();
            
            // Get the medication's local times 
            const localTimeStr = schedule.medication.times?.find(t => {
                // Since we don't know exact offset, show the original times from medication
                return true; // Return all times - frontend will handle display
            });
            
            return {
                ...schedule,
                localTimes: schedule.medication.times || [], // Original times user set
                userTimezone // Include timezone info
            };
        });

        sendSuccess(res, { schedules: enrichedSchedules, date: todayStart.toISOString().split("T")[0], timezone: userTimezone });
    } catch (err) {
        next(err);
    }
};

// ─── Weekly Schedule ──────────────────────────────────────────────────────────
const getWeeklySchedule = async (req, res, next) => {
    try {
        const { startDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date();
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 6);
        end.setUTCHours(23, 59, 59, 999);

        const schedules = await prisma.doseSchedule.findMany({
            where: {
                userId: req.user.id,
                scheduledAt: { gte: start, lte: end },
            },
            include: {
                medication: { select: { id: true, name: true, dosage: true, color: true } },
                doseLog: true,
            },
            orderBy: { scheduledAt: "asc" },
        });

        sendSuccess(res, { schedules, from: start, to: end });
    } catch (err) {
        next(err);
    }
};

// ─── Internal: generate dose schedules for N days ────────────────────────────
const generateFutureDoseSchedules = async (medication, days = 7, userTimezone = "UTC") => {
    const schedules = [];
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    // Ensure startDate is a proper Date at midnight UTC
    const medStartDate = new Date(medication.startDate);
    medStartDate.setUTCHours(0, 0, 0, 0);
    const medEndDate = medication.endDate ? new Date(medication.endDate) : null;
    if (medEndDate) medEndDate.setUTCHours(23, 59, 59, 999);

    for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setUTCDate(start.getUTCDate() + i);
        date.setUTCHours(0, 0, 0, 0);

        // Skip dates before startDate or after endDate
        if (date < medStartDate) continue;
        if (medEndDate && date > medEndDate) break;

        const doses = generateDoseSchedule(medication, date, userTimezone);
        for (const dose of doses) {
            schedules.push({
                userId: medication.userId,
                medicationId: medication.id,
                scheduledAt: dose.scheduledAt,
                windowStart: dose.windowStart,
                windowEnd: dose.windowEnd,
                status: "PENDING",
            });
        }
    }

    if (schedules.length > 0) {
        // Avoid duplicates
        await prisma.doseSchedule.createMany({
            data: schedules,
            skipDuplicates: true,
        });
        const logger = require("../utils/logger");
        const uniqueDates = schedules.map(s => s.scheduledAt.toISOString().split("T")[0]).filter((v, i, a) => a.indexOf(v) === i);
        
        // Show sample times (UTC stored, but should represent local times)
        const sample = schedules.slice(0, 3).map(s => {
            const time = s.scheduledAt.toISOString().substring(11, 16);
            return time;
        }).join(", ");
        
        logger.info(`[DOSE_SCHEDULE] Generated ${schedules.length} dose schedule(s) for medication ${medication.id} | Dates: ${uniqueDates.join(", ")} | Sample UTC times: ${sample} (these are UTC equivalents of local times)`);
    }
};

module.exports = {
    createMedication, getMedications, getMedication,
    updateMedication, deleteMedication,
    getTodaySchedule, getWeeklySchedule,
    generateFutureDoseSchedules,
};
