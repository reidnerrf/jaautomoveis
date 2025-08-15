
import express from 'express';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  incrementVehicleView,
} from '../controllers/vehicleController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(getVehicles).post(protect, createVehicle);
router.route('/:id').get(getVehicleById).put(protect, updateVehicle).delete(protect, deleteVehicle);
router.route('/:id/view').post(incrementVehicleView);

export default router;