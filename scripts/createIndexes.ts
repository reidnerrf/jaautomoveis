// Script to create necessary indexes for ViewLog collection
// Run with: npx ts-node scripts/createIndexes.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function createIndexes() {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI/MONGODB_URI environment variable is not defined');
    }

    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Import ViewLog model
    const ViewLog = mongoose.connection.collection('viewlogs');

    // Create indexes
    console.log('Creating indexes...');
    
    // Index on createdAt for time-based queries
    await ViewLog.createIndex({ createdAt: 1 });
    console.log('✓ Index created: createdAt_1');
    
    // Compound index on vehicle and createdAt for aggregation
    await ViewLog.createIndex({ vehicle: 1, createdAt: 1 });
    console.log('✓ Index created: vehicle_1_createdAt_1');
    
    // Index on vehicle for faster lookups
    await ViewLog.createIndex({ vehicle: 1 });
    console.log('✓ Index created: vehicle_1');

    console.log('All indexes created successfully!');
    
  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createIndexes();
