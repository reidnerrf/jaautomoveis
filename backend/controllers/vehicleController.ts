import express from 'express';
import Vehicle from '../models/Vehicle';
import ViewLog from '../models/ViewLog';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

const unlink = promisify(fs.unlink);

// Helper to delete image files from the filesystem
const deleteImageFiles = async (imagePaths: string[]) => {
    const root = path.resolve();
    for (const imagePath of imagePaths) {
        // Basic security check to ensure we only delete from the uploads folder
        if (imagePath && imagePath.startsWith('/uploads/')) {
            const filePath = path.join(root, imagePath);
            try {
                await unlink(filePath);
            } catch (err: any) {
                // It's okay if the file doesn't exist, but log other errors
                if (err.code !== 'ENOENT') {
                    console.error(`Error deleting file ${filePath}:`, err);
                }
            }
        }
    }
};

export const getVehicles = async (req: express.Request, res: express.Response) => {
  try {
    const { page = 1, limit = 12, make, model, year, minPrice, maxPrice, fuel, gearbox } = req.query;
    const filter: any = {
      ...(make && { make: { $regex: make, $options: 'i' } }),
      ...(model && { model: { $regex: model, $options: 'i' } }),
      ...(year && { year: +year }),
      ...(minPrice && { price: { $gte: +minPrice } }),
      ...(maxPrice && { price: { $lte: +maxPrice } }),
      ...(fuel && { fuel }),
      ...(gearbox && { gearbox }),
    };
    const [total, vehicles] = await Promise.all([
      Vehicle.countDocuments(filter),
      Vehicle.find(filter).skip((+page - 1) * +limit).limit(+limit).lean(),
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
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getVehicleById = async (req: express.Request, res: express.Response) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).lean();
    if (vehicle) {
      res.json(vehicle);
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createVehicle = async (req: express.Request, res: express.Response) => {
  try {
    const vehicle = new Vehicle(req.body);
    const createdVehicle = await vehicle.save();
    res.status(201).json(createdVehicle);
  } catch (error) {
    res.status(400).json({ message: 'Invalid vehicle data' });
  }
};

export const updateVehicle = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (vehicle) {
      const oldImages = vehicle.images || [];
      const newImages = req.body.images || [];
      const imagesToDelete = oldImages.filter(p => !newImages.includes(p));
      await deleteImageFiles(imagesToDelete);
      const updatedVehicle = await Vehicle.findByIdAndUpdate(id, req.body, { new: true }).lean();
      res.json(updatedVehicle);
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid vehicle data' });
  }
};

export const deleteVehicle = async (req: express.Request, res: express.Response) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (vehicle) {
      await deleteImageFiles(vehicle.images);
      await vehicle.deleteOne();
      res.json({ message: 'Vehicle removed' });
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const incrementVehicleView = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).lean();
    if (vehicle) {
      await ViewLog.create({ vehicle: vehicle._id });
      res.status(200).json({ message: 'View count updated', views: vehicle.views });
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    console.error('Error incrementing vehicle view:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getMostViewedVehicles = async (req: express.Request, res: express.Response) => {
  try {
    const { limit = 10, periodDays = 30 } = req.query;
    const since = new Date(Date.now() - Number(periodDays) * 24 * 60 * 60 * 1000);
    const results = await ViewLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$vehicle', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: +limit },
    ]);
    const vehicleIds = results.map(({ _id }) => _id);
    const vehicles = await Vehicle.find({ _id: { $in: vehicleIds } }).lean();
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching most viewed vehicles:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
