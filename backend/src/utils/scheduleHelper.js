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
 * Parse a "HH:MM" time string and apply it to a given date in user's timezone
 * @param {Date} date - The date 
 * @param {string} timeStr - "08:30" format (in user's local timezone)
 * @param {string} userTimezone - "Asia/Kolkata" 
 * @returns {Date} - Returns UTC datetime that represents that local time
 */
const applyTimeToDate = (date, timeStr, userTimezone = "UTC") => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    
    // STRATEGY: Calculate what UTC time corresponds to the local midnight in user's timezone
    const testUTC = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    
    // Format this UTC midnight AS IF viewing it from the user's timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: userTimezone
    });
    
    const parts = formatter.formatToParts(testUTC);
    const tzHourAtUTCMidnight = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const tzMinutesAtUTCMidnight = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
    
    // This is what hour of the day the user's timezone sees when UTC is at midnight
    // If user is at UTC+5:30, they see 05:30 when UTC is 00:00
    // If user is at UTC-5, they see 19:00 (previous day) when UTC is 00:00
    
    const logger = require('./logger');
    logger.debug(`[TIMEZONE DEBUG]`);
    logger.debug(`  Input: ${timeStr} in ${userTimezone}, Date: ${date.toISOString().split('T')[0]}`);
    logger.debug(`  Parsed hours=${hours}, minutes=${minutes}`);
    logger.debug(`  UTC midnight shows as ${String(tzHourAtUTCMidnight).padStart(2, '0')}:${String(tzMinutesAtUTCMidnight).padStart(2, '0')} in ${userTimezone}`);
    
    // Calculate UTC time:
    // Local time = UTC time + timezone_offset
    // Therefore: UTC time = local time - timezone_offset
    // 
    // Example: Asia/Kolkata (UTC+5:30)
    // - Local 08:38 should be UTC 03:08 (08:38 - 05:30 = 03:08)
    //
    // Example: UTC-5 (EST)
    // - Local 08:38 should be UTC 13:38 (08:38 - (-5:00) = 13:38)
    
    let utcHours = hours - tzHourAtUTCMidnight;
    let utcMinutes = minutes - tzMinutesAtUTCMidnight;
    
    logger.debug(`  Before adjustment: utcHours=${utcHours}, utcMinutes=${utcMinutes}`);
    
    // Fix negative minutes
    if (utcMinutes < 0) {
        utcHours -= 1;
        utcMinutes += 60;
    }
    
    // Fix negative hours (wraps to previous day)
    if (utcHours < 0) {
        utcHours += 24;
    }
    
    // Fix hours >= 24 (wraps to next day)
    if (utcHours >= 24) {
        utcHours -= 24;
    }
    
    const result = new Date(Date.UTC(year, month, day, utcHours, utcMinutes, 0, 0));
    logger.debug(`  Final UTC: ${String(utcHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')} → ${result.toISOString()}`);
    
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
const generateDoseSchedule = (medication, forDate, userTimezone = "UTC") => {
    const { times, frequency, customDays } = medication;
    const date = new Date(forDate);

    // Check if this medication should be taken today based on frequency
    const dayOfWeek = date.getUTCDay(); // 0=Sun

    if (frequency === "WEEKLY") {
        // If no custom days specified, generate for all days
        if (!customDays || customDays.length === 0) {
            // Default to all 7 days if not specified
        } else if (!customDays.includes(dayOfWeek)) {
            return [];
        }
    }
    
    if (frequency === "CUSTOM") {
        // If no custom days specified, generate for all days
        if (!customDays || customDays.length === 0) {
            // Default to all 7 days if not specified
        } else if (!customDays.includes(dayOfWeek)) {
            return [];
        }
    }

    return (times || []).map((timeStr) => {
        const scheduledAt = applyTimeToDate(date, timeStr, userTimezone);
        const windowStart = new Date(scheduledAt.getTime() - 30 * 60000); // 30min before (reminder sent)
        const windowEnd = new Date(scheduledAt.getTime() + 5 * 60000);    // 5min after (deadline to take)
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
