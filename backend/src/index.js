require("dotenv").config();
const app = require("./app");
const { startCronJobs } = require("./jobs/cron");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📦 Environment: ${process.env.NODE_ENV}`);

  // Start background cron jobs
  startCronJobs();
  logger.info("Cron jobs started");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Process terminated.");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});
