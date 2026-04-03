const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const { sendSuccess, sendCreated } = require("../utils/apiResponse");
const { calcAdherenceScore, startOfDay } = require("../utils/scheduleHelper");

// ─── Send Link Request ────────────────────────────────────────────────────────
const sendLinkRequest = async (req, res, next) => {
    try {
        const { patientEmail } = req.body;

        const patient = await prisma.user.findUnique({ where: { email: patientEmail } });
        if (!patient) throw new AppError("Patient not found with that email.", 404);
        if (patient.role !== "PATIENT") throw new AppError("This user is not a patient.", 400);
        if (patient.id === req.user.id) throw new AppError("Cannot link yourself.", 400);

        // Check existing
        const existing = await prisma.caregiverLink.findFirst({
            where: { caregiverId: req.user.id, patientId: patient.id },
        });
        if (existing) throw new AppError("Link request already exists.", 409);

        const link = await prisma.caregiverLink.create({
            data: { caregiverId: req.user.id, patientId: patient.id },
        });

        sendCreated(res, { link }, "Link request sent. Waiting for patient approval.");
    } catch (err) {
        next(err);
    }
};

// ─── Patient: Accept/Reject Link ──────────────────────────────────────────────
const respondToLinkRequest = async (req, res, next) => {
    try {
        const { linkId, accept } = req.body;

        const link = await prisma.caregiverLink.findFirst({
            where: { id: linkId, patientId: req.user.id },
        });
        if (!link) throw new AppError("Link request not found.", 404);

        if (accept) {
            await prisma.caregiverLink.update({ where: { id: linkId }, data: { isAccepted: true } });
            sendSuccess(res, {}, "Link accepted. Caregiver can now monitor you.");
        } else {
            await prisma.caregiverLink.delete({ where: { id: linkId } });
            sendSuccess(res, {}, "Link request rejected.");
        }
    } catch (err) {
        next(err);
    }
};

// ─── Get My Patients (for caregiver/doctor) ───────────────────────────────────
const getMyPatients = async (req, res, next) => {
    try {
        const links = await prisma.caregiverLink.findMany({
            where: { caregiverId: req.user.id, isAccepted: true },
            include: {
                patient: {
                    select: {
                        id: true, firstName: true, lastName: true, email: true, phone: true,
                        profile: { select: { dateOfBirth: true, bloodGroup: true, conditions: true } },
                    },
                },
            },
        });

        // Add adherence scores
        const since = new Date();
        since.setUTCDate(since.getUTCDate() - 30);

        const patients = await Promise.all(
            links.map(async (link) => {
                const stats = await prisma.adherenceStat.aggregate({
                    where: { userId: link.patientId, date: { gte: since } },
                    _sum: { scheduled: true, taken: true, late: true },
                });
                const taken = (stats._sum.taken || 0) + (stats._sum.late || 0);
                const score = calcAdherenceScore(taken, stats._sum.scheduled || 0);

                return {
                    linkId: link.id,
                    patient: link.patient,
                    adherenceScore: score,
                    lastMonthScheduled: stats._sum.scheduled || 0,
                    lastMonthTaken: taken,
                };
            })
        );

        sendSuccess(res, { patients });
    } catch (err) {
        next(err);
    }
};

// ─── Get Patient Detail (for caregiver) ──────────────────────────────────────
const getPatientDetail = async (req, res, next) => {
    try {
        const { patientId } = req.params;

        // Verify link
        const link = await prisma.caregiverLink.findFirst({
            where: { caregiverId: req.user.id, patientId, isAccepted: true },
        });
        if (!link) throw new AppError("You are not linked to this patient.", 403);

        const [patient, medications, recentLogs, streak, alerts] = await Promise.all([
            prisma.user.findUnique({
                where: { id: patientId },
                select: { id: true, firstName: true, lastName: true, email: true, phone: true, profile: true },
            }),
            prisma.medication.findMany({
                where: { userId: patientId, isActive: true },
            }),
            prisma.doseLog.findMany({
                where: { userId: patientId },
                orderBy: { takenAt: "desc" },
                take: 14,
                include: { medication: { select: { name: true, dosage: true } } },
            }),
            prisma.streak.findUnique({ where: { userId: patientId } }),
            prisma.caregiverAlert.findMany({
                where: { caregiverId: req.user.id, patientId, status: "UNREAD" },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
        ]);

        sendSuccess(res, { patient, medications, recentLogs, streak, unreadAlerts: alerts });
    } catch (err) {
        next(err);
    }
};

// ─── Get Caregiver Alerts ──────────────────────────────────────────────────────
const getCaregiverAlerts = async (req, res, next) => {
    try {
        const { status = "UNREAD", page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [alerts, total] = await Promise.all([
            prisma.caregiverAlert.findMany({
                where: { caregiverId: req.user.id, ...(status !== "ALL" && { status }) },
                skip,
                take: Number(limit),
                orderBy: { createdAt: "desc" },
            }),
            prisma.caregiverAlert.count({
                where: { caregiverId: req.user.id, ...(status !== "ALL" && { status }) },
            }),
        ]);

        sendSuccess(res, { alerts, total, page: Number(page) });
    } catch (err) {
        next(err);
    }
};

// ─── Mark Alert Read ──────────────────────────────────────────────────────────
const markAlertRead = async (req, res, next) => {
    try {
        const alert = await prisma.caregiverAlert.findFirst({
            where: { id: req.params.alertId, caregiverId: req.user.id },
        });
        if (!alert) throw new AppError("Alert not found.", 404);

        await prisma.caregiverAlert.update({
            where: { id: alert.id },
            data: { status: "READ" },
        });
        sendSuccess(res, {}, "Alert marked as read.");
    } catch (err) {
        next(err);
    }
};

// ─── Remove patient link ──────────────────────────────────────────────────────
const unlinkPatient = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        await prisma.caregiverLink.deleteMany({
            where: { caregiverId: req.user.id, patientId },
        });
        sendSuccess(res, {}, "Patient unlinked.");
    } catch (err) {
        next(err);
    }
};

// ─── Get pending link requests (patient POV) ──────────────────────────────────
const getPendingLinkRequests = async (req, res, next) => {
    try {
        const requests = await prisma.caregiverLink.findMany({
            where: { patientId: req.user.id, isAccepted: false },
            include: {
                caregiver: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
            },
        });
        sendSuccess(res, { requests });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    sendLinkRequest, respondToLinkRequest,
    getMyPatients, getPatientDetail,
    getCaregiverAlerts, markAlertRead,
    unlinkPatient, getPendingLinkRequests,
};
