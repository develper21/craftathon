const router = require("express").Router();
const prisma = require("../config/prisma");

// GET /api/health - Health check for Render deployment
router.get("/", async (req, res) => {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;
        
        res.status(200).json({
            success: true,
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            services: {
                api: "up",
                database: "up"
            }
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            services: {
                api: "up",
                database: "down"
            },
            error: "Database connection failed"
        });
    }
});

module.exports = router;
