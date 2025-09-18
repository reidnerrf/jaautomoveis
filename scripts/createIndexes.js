// Script to create necessary indexes for ViewLog collection
// Run with: node scripts/createIndexes.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function createIndexes() {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI/MONGODB_URI environment variable is not defined");
    }

    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    // Get collections
    const ViewLog = mongoose.connection.collection("viewlogs");
    const Vehicles = mongoose.connection.collection("vehicles");
    const Analytics = mongoose.connection.collection("analytics");

    // Create indexes
    console.log("Creating indexes...");

    // Index on createdAt for time-based queries
    await ViewLog.createIndex({ createdAt: 1 });
    console.log("✓ Index created: createdAt_1");

    // Compound index on vehicle and createdAt for aggregation
    await ViewLog.createIndex({ vehicle: 1, createdAt: 1 });
    console.log("✓ Index created: vehicle_1_createdAt_1");

    // Index on vehicle for faster lookups
    await ViewLog.createIndex({ vehicle: 1 });
    console.log("✓ Index created: vehicle_1");

    // Vehicles: status, views, updatedAt
    await Vehicles.createIndex({ status: 1 });
    console.log("✓ Index created: vehicles.status_1");
    await Vehicles.createIndex({ views: -1 });
    console.log("✓ Index created: vehicles.views_-1");
    await Vehicles.createIndex({ updatedAt: -1 });
    console.log("✓ Index created: vehicles.updatedAt_-1");

    // Analytics: action + timestamp
    await Analytics.createIndex({ action: 1, timestamp: -1 });
    console.log("✓ Index created: analytics.action_1_timestamp_-1");
    await Analytics.createIndex({ timestamp: -1 });
    console.log("✓ Index created: analytics.timestamp_-1");

    console.log("All indexes created successfully!");
  } catch (error) {
    console.error("Error creating indexes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

createIndexes();
