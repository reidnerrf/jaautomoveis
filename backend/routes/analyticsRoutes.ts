import express from "express";
import {
  getMonthlyViews,
  getDashboardStats,
  getRealtimeStats,
  getLikesByVehicle,
  getDailyViewsLast30Days,
  purgeOldAnalytics,
} from "../controllers/analyticsController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Public endpoints for performance monitoring and offline sync (no auth required)
router.post("/web-vitals", (req, res) => {
  try {
    // Log web vitals data for performance monitoring
    console.log("Web Vitals:", req.body);
    res.status(200).json({ success: true, message: "Web vitals recorded" });
  } catch (error) {
    console.error("Error recording web vitals:", error);
    res.status(500).json({ success: false, message: "Failed to record web vitals" });
  }
});

router.post("/batch", (req, res) => {
  try {
    // Process batch analytics data from offline sync
    const analyticsData = req.body;
    console.log("Batch Analytics:", analyticsData);
    res.status(200).json({ success: true, message: "Batch analytics processed" });
  } catch (error) {
    console.error("Error processing batch analytics:", error);
    res.status(500).json({ success: false, message: "Failed to process batch analytics" });
  }
});

// Protected endpoints (require authentication)
router.get("/monthly-views", protect, getMonthlyViews);
router.get("/dashboard-stats", protect, getDashboardStats);
router.get("/realtime-stats", protect, getRealtimeStats);
// Público: apenas contagem agregada
router.get("/likes/by-vehicle", getLikesByVehicle);
// Últimos 30 dias (protegido)
router.get("/views/last-30-days", protect, getDailyViewsLast30Days);
// Limpeza de analytics > 3 meses (protegido)
router.delete("/purge-old", protect, purgeOldAnalytics);

export default router;
