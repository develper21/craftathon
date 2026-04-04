const prisma = require("../config/prisma");
const logger = require("../utils/logger");
const { sendEmail, emailTemplates } = require("../utils/email");

/**
 * Create an in-app notification
 */
const createInAppNotification = async (userId, type, title, body, data = null) => {
    try {
        await prisma.notification.create({
            data: { userId, type, channel: "IN_APP", title, body, data, sentAt: new Date() },
        });
    } catch (err) {
        logger.error(`Failed to create notification: ${err.message}`);
    }
};

/**
 * Notify all caregivers of a patient about a missed dose
 * @param {string} patientId
 * @param {string} medicationName
 * @param {string} scheduledTime
 */
const notifyCaregivers = async (patientId, medicationName, scheduledTime) => {
    try {
        const links = await prisma.caregiverLink.findMany({
            where: { patientId, isAccepted: true },
            include: {
                caregiver: { select: { id: true, email: true, firstName: true } },
                patient: { select: { firstName: true, lastName: true } },
            },
        });

        if (links.length === 0) return;

        const patientName = `${links[0].patient.firstName} ${links[0].patient.lastName}`;

        for (const link of links) {
            const { caregiver } = link;

            // Create caregiver alert
            await prisma.caregiverAlert.create({
                data: {
                    caregiverId: caregiver.id,
                    patientId,
                    type: "MISSED_DOSE",
                    message: `${patientName} missed their ${medicationName} dose scheduled at ${scheduledTime}.`,
                    data: { medicationName, scheduledTime, patientName },
                },
            });

            // In-app notification for caregiver
            await createInAppNotification(
                caregiver.id,
                "MISSED_DOSE",
                `⚠️ Missed Dose – ${patientName}`,
                `${patientName} missed their ${medicationName} dose at ${scheduledTime}.`
            );

            // Email notification
            const { subject, html } = emailTemplates.missedDoseAlert(
                caregiver.firstName, patientName, medicationName, scheduledTime
            );
            sendEmail(caregiver.email, subject, html).catch(() => { });
        }

        logger.info(`Notified ${links.length} caregivers about ${patientName}'s missed ${medicationName} dose.`);
    } catch (err) {
        logger.error(`Failed to notify caregivers: ${err.message}`);
    }
};

/**
 * Send dose reminder notification (in-app + email)
 */
const sendDoseReminder = async (userId, medicationName, scheduledTime) => {
    try {
        // Get user details
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, firstName: true },
        });

        if (!user) {
            logger.warn(`[REMINDER] User ${userId} not found`);
            return;
        }

        if (!user.email) {
            logger.warn(`[REMINDER] User ${user.id} has no email`);
            return;
        }

        // Create in-app notification
        await createInAppNotification(
            userId,
            "DOSE_REMINDER",
            "💊 Medication Reminder",
            `Time to take your ${medicationName} (scheduled at ${scheduledTime}).`
        );

        // Send email reminder
        try {
            const { subject, html } = emailTemplates.medicationReminder(
                user.firstName || "User",
                medicationName,
                scheduledTime
            );
            await sendEmail(user.email, subject, html);
            logger.info(`✓ Reminder email sent to ${user.email} for ${medicationName} at ${scheduledTime}`);
        } catch (emailErr) {
            logger.error(`✗ Failed to send reminder email to ${user.email}: ${emailErr.message}`);
        }
    } catch (err) {
        logger.error(`Failed to send dose reminder: ${err.message}`);
    }
};

module.exports = { createInAppNotification, notifyCaregivers, sendDoseReminder };
