import express from "express";
import Vehicle from "../models/Vehicle";
import ViewLog from "../models/ViewLog";
import fs from "fs/promises";
import path from "path";
import { getSocketServer } from "../socket";

// Helper to delete image files from the filesystem
const deleteImageFiles = async (imagePaths: string[]) => {
  const uploadsRoot = path.join(process.cwd(), "uploads");
  for (const rawPath of imagePaths) {
    // Only allow deletion inside the uploads folder and normalize the path
    if (rawPath && rawPath.startsWith("/uploads/")) {
      const relativePath = rawPath.replace(/^\/+uploads\/+/, "");
      const filePath = path.join(uploadsRoot, relativePath);
      try {
        await fs.unlink(filePath);
      } catch (err: any) {
        // Ignore missing files; log others
        if (err && err.code !== "ENOENT") {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      }
    }
  }
};

export const getVehicles = async (req: express.Request, res: express.Response) => {
  try {
    const {
      page = 1,
      limit = 12,
      make,
      model,
      year,
      minPrice,
      maxPrice,
      fuel,
      gearbox,
    } = req.query;
    const filter: any = {
      ...(make && { make: { $regex: make, $options: "i" } }),
      ...(model && { model: { $regex: model, $options: "i" } }),
      ...(year && { year: +year }),
      ...(minPrice && { price: { $gte: +minPrice } }),
      ...(maxPrice && { price: { $lte: +maxPrice } }),
      ...(fuel && { fuel }),
      ...(gearbox && { gearbox }),
    };
    const [total, vehicles] = await Promise.all([
      Vehicle.countDocuments(filter),
      Vehicle.find(filter)
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .lean(),
    ]);
    res.json({
      vehicles,
      pagination: {
        page: +page,
        limit: +limit,
        total,
        pages: Math.ceil(total / +limit),
        hasNext: +page < Math.ceil(total / +limit),
        hasPrev: +page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getVehicleById = async (req: express.Request, res: express.Response) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).lean();
    if (vehicle) {
      res.json(vehicle);
    } else {
      res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createVehicle = async (req: express.Request, res: express.Response) => {
  try {
    const vehicle = new Vehicle(req.body);
    const createdVehicle = await vehicle.save();
    // Emit real-time event for admins
    try {
      getSocketServer()?.emit(
        "vehicle-created",
        createdVehicle.toObject ? createdVehicle.toObject() : createdVehicle
      );
    } catch (e) {
      // ignore socket broadcast errors in API response path
    }
    res.status(201).json(createdVehicle);
  } catch (error) {
    res.status(400).json({ message: "Invalid vehicle data" });
  }
};

export const updateVehicle = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (vehicle) {
      const oldImages = vehicle.images || [];
      const newImages = req.body.images || [];
      const imagesToDelete = oldImages.filter((p) => !newImages.includes(p));
      await deleteImageFiles(imagesToDelete);
      const updatedVehicle = await Vehicle.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
      ).lean();
      // Emit real-time update
      try {
        getSocketServer()?.emit("vehicle-updated", updatedVehicle);
      } catch (e) {
        // ignore socket broadcast errors
      }
      res.json(updatedVehicle);
    } else {
      res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Invalid vehicle data" });
  }
};

export const deleteVehicle = async (req: express.Request, res: express.Response) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (vehicle) {
      if (Array.isArray((vehicle as any).images) && (vehicle as any).images.length > 0) {
        await deleteImageFiles((vehicle as any).images as string[]);
      }
      await vehicle.deleteOne();
      try {
        getSocketServer()?.emit("vehicle-deleted", req.params.id);
      } catch (e) {
        // ignore socket broadcast errors
      }
      res.json({ message: "Vehicle removed" });
    } else {
      res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const incrementVehicleView = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).lean();
    if (vehicle) {
      await ViewLog.create({ vehicle: vehicle._id });
      res.status(200).json({ message: "View count updated", views: vehicle.views });
    } else {
      res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (error) {
    console.error("Error incrementing vehicle view:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMostViewedVehicles = async (req: express.Request, res: express.Response) => {
  try {
    const { limit = 10, periodDays = 30 } = req.query;
    const since = new Date(Date.now() - Number(periodDays) * 24 * 60 * 60 * 1000);

    // Optimized aggregation using $lookup to join with Vehicle collection
    const results = await ViewLog.aggregate(
      [
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$vehicle", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: +limit },
        {
          $lookup: {
            from: "vehicles",
            localField: "_id",
            foreignField: "_id",
            as: "vehicle",
          },
        },
        // Keep only entries that still have a corresponding vehicle
        { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: false } },
        // Return only the fields needed by the frontend to avoid over-fetching
        {
          $project: {
            _id: "$vehicle._id",
            name: "$vehicle.name",
            price: "$vehicle.price",
            make: "$vehicle.make",
            model: "$vehicle.model",
            year: "$vehicle.year",
            km: "$vehicle.km",
            color: "$vehicle.color",
            gearbox: "$vehicle.gearbox",
            fuel: "$vehicle.fuel",
            doors: "$vehicle.doors",
            additionalInfo: "$vehicle.additionalInfo",
            optionals: "$vehicle.optionals",
            images: "$vehicle.images",
            description: "$vehicle.description",
            createdAt: "$vehicle.createdAt",
            updatedAt: "$vehicle.updatedAt",
            views: "$views",
          },
        },
      ],
      {
        maxTimeMS: 30000, // 30 seconds timeout
        allowDiskUse: true, // Allow disk usage for large aggregations
      }
    );

    if (!Array.isArray(results)) {
      throw new Error("Most viewed vehicles aggregation did not return an array");
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching most viewed vehicles:", error);

    // Provide more specific error messages
    const err = error as Error;
    if (err.name === "MongoServerSelectionError") {
      res.status(503).json({ message: "Database connection error. Please try again later." });
    } else if (err.name === "MongooseError" && err.message.includes("buffering timed out")) {
      res.status(504).json({ message: "Query timeout. The operation took too long to complete." });
    } else if (err.name === "TypeError" && err.message.includes("Cannot read property")) {
      res.status(500).json({ message: "Server Error" });
    } else {
      res.status(500).json({ message: "Server Error" });
    }
  }
};

// Remove a single image from a vehicle and delete its file from /uploads
export const deleteVehicleImage = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { path: imagePath } = req.body as { path?: string };

    if (!imagePath || !imagePath.startsWith("/uploads/")) {
      return res.status(400).json({ message: "Parâmetro 'path' inválido" });
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Remove from DB array
    const images = vehicle.images || [];
    if (!images.includes(imagePath)) {
      return res.status(404).json({ message: "Imagem não encontrada no veículo" });
    }

    vehicle.images = images.filter((p: string) => p !== imagePath) as any;
    await vehicle.save();

    // Delete from filesystem
    await deleteImageFiles([imagePath]);

    // Emit update event
    try {
      getSocketServer()?.emit("vehicle-updated", vehicle.toObject());
    } catch {}

    return res.json({ success: true, images: vehicle.images });
  } catch (error) {
    console.error("Error deleting vehicle image:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
