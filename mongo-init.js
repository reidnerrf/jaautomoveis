// MongoDB initialization script for Docker
// This script runs when the MongoDB container starts for the first time

// Switch to the JaAutomoveis database
db = db.getSiblingDB('JaAutomoveis');

// Create collections with validation
db.createCollection('vehicles', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'price', 'make', 'model', 'year'],
      properties: {
        name: { bsonType: 'string' },
        price: { bsonType: 'number', minimum: 0 },
        make: { bsonType: 'string' },
        model: { bsonType: 'string' },
        year: { bsonType: 'number', minimum: 1900, maximum: 2030 },
        km: { bsonType: 'number', minimum: 0 },
        color: { bsonType: 'string' },
        gearbox: { bsonType: 'string' },
        fuel: { bsonType: 'string' },
        doors: { bsonType: 'number', minimum: 2, maximum: 5 },
        additionalInfo: { bsonType: 'string' },
        optionals: { bsonType: 'array' },
        images: { bsonType: 'array' },
        views: { bsonType: 'number', minimum: 0 },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password', 'role'],
      properties: {
        username: { bsonType: 'string', minLength: 3, maxLength: 30 },
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        password: { bsonType: 'string', minLength: 6 },
        role: { bsonType: 'string', enum: ['admin', 'user'] },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['type', 'timestamp'],
      properties: {
        type: { bsonType: 'string' },
        data: { bsonType: 'object' },
        timestamp: { bsonType: 'date' },
        ip: { bsonType: 'string' },
        userAgent: { bsonType: 'string' }
      }
    }
  }
});

db.createCollection('viewlogs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['vehicleId', 'timestamp'],
      properties: {
        vehicleId: { bsonType: 'objectId' },
        timestamp: { bsonType: 'date' },
        ip: { bsonType: 'string' },
        userAgent: { bsonType: 'string' },
        referrer: { bsonType: 'string' }
      }
    }
  }
});

// Create indexes for better performance
db.vehicles.createIndex({ make: 1, model: 1 });
db.vehicles.createIndex({ price: 1 });
db.vehicles.createIndex({ year: 1 });
db.vehicles.createIndex({ views: -1 });
db.vehicles.createIndex({ createdAt: -1 });

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

db.analytics.createIndex({ type: 1, timestamp: -1 });
db.analytics.createIndex({ timestamp: -1 });

db.viewlogs.createIndex({ vehicleId: 1, timestamp: -1 });
db.viewlogs.createIndex({ timestamp: -1 });

print('MongoDB initialization completed successfully!');
print('Collections created: vehicles, users, analytics, viewlogs');
print('Indexes created for optimal performance');