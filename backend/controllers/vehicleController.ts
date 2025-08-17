import express from 'express';
import Vehicle from '../models/Vehicle';
import ViewLog from '../models/ViewLog';
import fs from 'fs/promises';
import path from 'path';

// Helper to delete image files from the filesystem
const deleteImageFiles = async (imagePaths: string[]) => {
    if (!imagePaths || imagePaths.length === 0) return;
    const root = path.resolve();
    for (const imagePath of imagePaths) {
        // Basic security check to ensure we only delete from the uploads folder
        if (imagePath && imagePath.startsWith('/uploads/')) {
            const filePath = path.join(root, imagePath);
            try {
                await fs.unlink(filePath);
            } catch (err: any) {
                // It's okay if the file doesn't exist, but log other errors
                if (err.code !== 'ENOENT') {
                    console.error(`Error deleting file ${filePath}:`, err);
                }
            }
        }
    }
};


// @desc    Fetch all vehicles with pagination and filtering
// @route   GET /api/vehicles
// @access  Public
export const getVehicles = async (req: express.Request, res: express.Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    
    if (req.query.make) filter.make = { $regex: req.query.make, $options: 'i' };
    if (req.query.model) filter.model = { $regex: req.query.model, $options: 'i' };
    if (req.query.year) filter.year = parseInt(req.query.year as string);
    if (req.query.minPrice) filter.price = { $gte: parseInt(req.query.minPrice as string) };
    if (req.query.maxPrice) {
      if (filter.price) {
        filter.price.$lte = parseInt(req.query.maxPrice as string);
      } else {
        filter.price = { $lte: parseInt(req.query.maxPrice as string) };
      }
    }
    if (req.query.fuel) filter.fuel = req.query.fuel;
    if (req.query.gearbox) filter.gearbox = req.query.gearbox;
    
    // Get total count for pagination
    const total = await Vehicle.countDocuments(filter);
    
    // Get vehicles with pagination
    const vehicles = await Vehicle.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    res.json({
      vehicles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
export const getVehicleById = async (req: express.Request, res: express.Response) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (vehicle) {
      res.json(vehicle);
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
     res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
export const createVehicle = async (req: express.Request, res: express.Response) => {
  try {
    const vehicle = new Vehicle(req.body);
    const createdVehicle = await vehicle.save();
    res.status(201).json(createdVehicle);
  } catch (error) {
    res.status(400).json({ message: 'Invalid vehicle data' });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
export const updateVehicle = async (req: express.Request, res: express.Response) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      const oldImagePaths = vehicle.images || [];
      const newImagePaths = req.body.images || [];

      // Find images that were in the old array but not the new one, and delete them
      const imagesToDelete = oldImagePaths.filter(p => !newImagePaths.includes(p));
      await deleteImageFiles(imagesToDelete);
      
      const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedVehicle);
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
     res.status(400).json({ message: 'Invalid vehicle data' });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
export const deleteVehicle = async (req: express.Request, res: express.Response) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      // Delete all associated images from filesystem first
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

// @desc    Increment vehicle view count and log the view
// @route   POST /api/vehicles/:id/view
// @access  Public
export const incrementVehicleView = async (req: express.Request, res: express.Response) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (vehicle) {
      // Increment total views on the vehicle document
      vehicle.views = (vehicle.views || 0) + 1;
      
      // Concurrently save the vehicle update and create a new timestamped view log
      await Promise.all([
        vehicle.save(),
        ViewLog.create({ vehicle: vehicle._id })
      ]);

      res.status(200).json({ message: 'View count updated', views: vehicle.views });
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    // This action is not critical, so we can fail silently on the server
    // to avoid unnecessary error noise if something goes wrong.
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get most viewed vehicles
// @route   GET /api/vehicles/most-viewed
// @access  Public
export const getMostViewedVehicles = async (req: express.Request, res: express.Response) => {
  try {
    const limit = Math.max(1, Math.min(50, parseInt(String(req.query.limit || '10'), 10)));
    const periodDays = Math.max(0, parseInt(String(req.query.periodDays || '30'), 10));

    // If periodDays > 0, compute trending by time window using ViewLog aggregation
    if (periodDays > 0) {
      const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

      const results = await ViewLog.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$vehicle', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: limit }
      ]);

      const vehicleIds = results.map(r => r._id);

      if (vehicleIds.length > 0) {
        const vehicles = await Vehicle.find({ _id: { $in: vehicleIds } });
        // Reorder vehicles to match aggregation order
        const ordered = vehicleIds
          .map(id => vehicles.find(v => String(v._id) === String(id)))
          .filter(Boolean);
        return res.json(ordered);
      }
      // Fallback to total views if no logs
    }

    const fallbackVehicles = await Vehicle.find({}).sort({ views: -1 }).limit(limit);
    res.json(fallbackVehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};