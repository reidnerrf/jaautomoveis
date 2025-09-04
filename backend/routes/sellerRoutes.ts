import express from "express";
import { protect } from "../middleware/authMiddleware";
import { listSellers, getSellerById, createSeller, updateSeller, deleteSeller } from "../controllers/sellerController";

const router = express.Router();

router.route("/").get(protect, listSellers).post(protect, createSeller);
router.route("/:id").get(protect, getSellerById).put(protect, updateSeller).delete(protect, deleteSeller);

export default router;

