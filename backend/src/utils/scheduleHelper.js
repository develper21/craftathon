/**
 * Schedule & Adherence calculation helpers
 */

/**
 * Calculate adherence score (percentage)
 * @param {number} taken
 * @param {number} scheduled
 * @returns {number}
 */
const calcAdherenceScore = (taken, scheduled) => {
    if (scheduled === 0) return 100;
    return Math.round((taken / scheduled) * 100 * 10) / 10; // one decimal
};

/**
 * Get start-of-day UTC Date for a given date
 * @param {Date|string} date
 * @returns {Date}
 */
const startOfDay = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

/**
 * Get end-of-day UTC Date
 */
const endOfDay = (date) => {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 999);
    return d;
};

/**
 * Get date range for a given week (Mon-Sun)
 * @param {Date} anyDayInWeek
 * @returns {{ start: Date, end: Date }}
 */
const getWeekRange = (anyDayInWeek = new Date()) => {
    const d = new Date(anyDayInWeek);
    const day = d.getUTCDay(); // 0=Sun
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Mon
    const start = new Date(d.setUTCDate(diff));
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
    end.setUTCHours(23, 59, 59, 999);
    return { start, end };
};

/**
 * Parse a "HH:MM" time string and apply it to a given date
 * @param {Date} date
 * @param {string} timeStr "08:30"
 * @returns {Date}
 */
const applyTimeToDate = (date, timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const result = new Date(date);
    result.setUTCHours(hours, minutes, 0, 0);
    return result;
};

/**
 * Determine if a dose is late (taken after scheduled + 15 min grace)
 * @param {Date} scheduledAt
 * @param {Date} takenAt
 * @returns {{ isLate: boolean, minutesLate: number }}
 */
const calcLateness = (scheduledAt, takenAt) => {
    const diffMs = new Date(takenAt) - new Date(scheduledAt);
    const minutesLate = Math.floor(diffMs / 60000);
    return {
        isLate: minutesLate > 15,
        minutesLate: minutesLate > 0 ? minutesLate : 0,
    };
};

/**
 * Format date as YYYY-MM-DD
 */
const formatDate = (date) => {
    return new Date(date).toISOString().split("T")[0];
};

/**
 * Generate upcoming dose schedule dates from medication config
 * Returns array of { scheduledAt, windowStart, windowEnd }
 */
const generateDoseSchedule = (medication, forDate) => {
    const { times, frequency, customDays } = medication;
    const date = new Date(forDate);

    // Check if this medication should be taken today based on frequency
    const dayOfWeek = date.getUTCDay(); // 0=Sun

    if (frequency === "WEEKLY" && !customDays?.includes(dayOfWeek)) {
        return [];
    }
    if (frequency === "CUSTOM" && !customDays?.includes(dayOfWeek)) {
        return [];
    }

    return (times || []).map((timeStr) => {
        const scheduledAt = applyTimeToDate(date, timeStr);
        const windowStart = new Date(scheduledAt.getTime() - 30 * 60000); // 30min before
        const windowEnd = new Date(scheduledAt.getTime() + 60 * 60000);   // 60min after
        return { scheduledAt, windowStart, windowEnd };
    });
};

module.exports = {
    calcAdherenceScore,
    startOfDay,
    endOfDay,
    getWeekRange,
    applyTimeToDate,
    calcLateness,
    formatDate,
    generateDoseSchedule,
};
