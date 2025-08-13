
import express from 'express';
import Vehicle from '../models/Vehicle';

// @desc    Fetch all vehicles
// @route   GET /api/vehicles
// @access  Public
export const getVehicles = async (req: express.Request, res: express.Response) => {
  try {
    const vehicles = await Vehicle.find({});
    res.json(vehicles);
  } catch (error) {
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
      await vehicle.deleteOne();
      res.json({ message: 'Vehicle removed' });
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
