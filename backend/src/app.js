const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./utils/logger");

// Route imports
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const medicationRoutes = require("./routes/medication.routes");
const doseRoutes = require("./routes/dose.routes");
const adherenceRoutes = require("./routes/adherence.routes");
const caregiverRoutes = require("./routes/caregiver.routes");
const notificationRoutes = require("./routes/notification.routes");
const reportRoutes = require("./routes/report.routes");
const healthRoutes = require("./routes/health.routes");

const { errorHandler } = require("./middlewares/errorHandler");
const { notFound } = require("./middlewares/notFound");

const app = express();

// ─── Middlewares ─────────────────────────────────────────────────────────────
// Configure CORS with proper origin handling
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',        // Backend itself
    'http://localhost:5173',
    'http://localhost:3173',
    'https://craftathon.vercel.app',
    'https://craftathon.onrender.com',
    process.env.BACKEND_URL?.replace(/\/$/, ''),  // Production backend URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan("combined", {
    stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "Medication Adherence API",
        version: "1.0.0",
    });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const API = "/api/v1";

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/medications`, medicationRoutes);
app.use(`${API}/doses`, doseRoutes);
app.use(`${API}/adherence`, adherenceRoutes);
app.use(`${API}/caregivers`, caregiverRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/reports`, reportRoutes);
app.use(`${API}/health`, healthRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
