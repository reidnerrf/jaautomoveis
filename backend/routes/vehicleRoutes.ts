import express from "express";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  incrementVehicleView,
  getMostViewedVehicles,
  deleteVehicleImage,
} from "../controllers/vehicleController";
import {
  invalidateVehicleCacheMiddleware,
  vehicleDetailCacheMiddleware,
} from "../middleware/cacheMiddleware";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router
  .route("/")
  .get(getVehicles)
  .post(protect, invalidateVehicleCacheMiddleware, createVehicle);
router.route("/most-viewed").get(getMostViewedVehicles);
router
  .route("/:id")
  .get(vehicleDetailCacheMiddleware, getVehicleById)
  .put(protect, invalidateVehicleCacheMiddleware, updateVehicle)
  .delete(protect, invalidateVehicleCacheMiddleware, deleteVehicle);
router.route("/:id/view").post(incrementVehicleView);
router
  .route("/:id/images")
  .delete(protect, invalidateVehicleCacheMiddleware, deleteVehicleImage);

export default router;
