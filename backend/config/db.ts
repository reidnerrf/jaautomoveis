import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  let retryCount = 0;
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds

  const connect = async (): Promise<void> => {
    try {
      const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

      if (!mongoURI) {
        throw new Error('MONGO_URI/MONGODB_URI is not defined in environment variables');
      }

      await mongoose.connect(mongoURI, {
        maxPoolSize: 10, // Maximum number of connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
      });

      console.log('MongoDB Connected Successfully');

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
      });

    } catch (error) {
      console.error(`Error connecting to MongoDB (attempt ${retryCount + 1}):`, error);

      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying connection in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return connect();
      } else {
        console.error('Max connection attempts reached. Exiting...');
        process.exit(1);
      }
    }
  };

  return connect();
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

export default connectDB;