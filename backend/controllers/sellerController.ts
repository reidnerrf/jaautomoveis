import express from "express";
import Seller from "../models/Seller";

export const listSellers = async (req: express.Request, res: express.Response) => {
  try {
    const { page = 1, limit = 50, q, active } = req.query;
    const filter: any = {};
    if (q) filter.name = { $regex: String(q), $options: "i" };
    if (typeof active !== "undefined") filter.active = String(active) === "true";
    const [total, sellers] = await Promise.all([
      Seller.countDocuments(filter),
      Seller.find(filter)
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .sort({ name: 1 })
        .lean(),
    ]);
    res.json({
      sellers,
      pagination: {
        page: +page,
        limit: +limit,
        total,
        pages: Math.ceil(total / +limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getSellerById = async (req: express.Request, res: express.Response) => {
  try {
    const seller = await Seller.findById(req.params.id).lean();
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createSeller = async (req: express.Request, res: express.Response) => {
  try {
    const created = await Seller.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: "Invalid seller data" });
  }
};

export const updateSeller = async (req: express.Request, res: express.Response) => {
  try {
    const updated = await Seller.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: "Seller not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Invalid seller data" });
  }
};

export const deleteSeller = async (req: express.Request, res: express.Response) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    await seller.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

