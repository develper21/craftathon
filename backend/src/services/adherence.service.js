const prisma = require("../config/prisma");
const { calcAdherenceScore, startOfDay, endOfDay } = require("../utils/scheduleHelper");
const logger = require("../utils/logger");

/**
 * Recalculate and upsert AdherenceStat for a user on a given date
 * @param {string} userId
 * @param {Date} date
 */
const updateAdherenceStats = async (userId, date = new Date()) => {
    try {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const [scheduled, taken, missed, late, skipped] = await Promise.all([
            prisma.doseSchedule.count({ where: { userId, scheduledAt: { gte: dayStart, lte: dayEnd } } }),
            prisma.doseLog.count({ where: { userId, takenAt: { gte: dayStart, lte: dayEnd }, status: "TAKEN" } }),
            prisma.doseSchedule.count({ where: { userId, scheduledAt: { gte: dayStart, lte: dayEnd }, status: "MISSED" } }),
            prisma.doseLog.count({ where: { userId, takenAt: { gte: dayStart, lte: dayEnd }, status: "LATE" } }),
            prisma.doseLog.count({ where: { userId, takenAt: { gte: dayStart, lte: dayEnd }, status: "SKIPPED" } }),
        ]);

        const adherenceScore = calcAdherenceScore(taken + late, scheduled);
        const streakDay = adherenceScore >= 80; // considered adherent

        await prisma.adherenceStat.upsert({
            where: { userId_date: { userId, date: dayStart } },
            create: { userId, date: dayStart, scheduled, taken, missed, late, skipped, adherenceScore, streakDay },
            update: { scheduled, taken, missed, late, skipped, adherenceScore, streakDay },
        });

        logger.debug(`AdherenceStat updated for ${userId} on ${dayStart.toISOString().split("T")[0]}: score=${adherenceScore}%`);
    } catch (err) {
        logger.error(`Failed to update adherence stats: ${err.message}`);
    }
};

/**
 * Update streak for a user
 * @param {string} userId
 */
const updateStreak = async (userId) => {
    try {
        const today = startOfDay(new Date());

        // Get last 90 days stats
        const stats = await prisma.adherenceStat.findMany({
            where: { userId, date: { lte: today }, streakDay: true },
            orderBy: { date: "desc" },
        });

        let currentStreak = 0;
        let checkDate = new Date(today);

        for (const stat of stats) {
            const statDate = startOfDay(stat.date);
            if (statDate.getTime() === checkDate.getTime()) {
                currentStreak++;
                checkDate.setUTCDate(checkDate.getUTCDate() - 1);
            } else {
                break;
            }
        }

        const existing = await prisma.streak.findUnique({ where: { userId } });
        const longestStreak = Math.max(currentStreak, existing?.longestStreak || 0);

        await prisma.streak.upsert({
            where: { userId },
            create: { userId, currentStreak, longestStreak, lastActiveDay: today },
            update: { currentStreak, longestStreak, lastActiveDay: today },
        });

        // Milestone notifications
        const milestones = [7, 14, 30, 60, 90, 180, 365];
        if (milestones.includes(currentStreak)) {
            await prisma.notification.create({
                data: {
                    userId,
                    type: "STREAK_MILESTONE",
                    channel: "IN_APP",
                    title: `${currentStreak}-Day Streak!`,
                    body: `Amazing! You've taken your medications for ${currentStreak} days in a row. Keep it up!`,
                },
            });
        }

        logger.debug(`Streak updated for ${userId}: current=${currentStreak}, longest=${longestStreak}`);
    } catch (err) {
        logger.error(`Failed to update streak: ${err.message}`);
    }
};

module.exports = { updateAdherenceStats, updateStreak };
