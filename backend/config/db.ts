import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  let retryCount = 0;
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds

  const connect = async (): Promise<void> => {
    try {
      const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

      if (!mongoURI) {
        throw new Error(
          "MONGO_URI/MONGODB_URI environment variable is not defined",
        );
      }

      await mongoose.connect(mongoURI, {
        maxPoolSize: 10, // Maximum number of connections
        serverSelectionTimeoutMS: 10000, // Increase to 10 seconds for slower connections
        socketTimeoutMS: 60000, // Increase to 60 seconds for long operations
        bufferCommands: false, // Disable mongoose buffering
        waitQueueTimeoutMS: 10000, // Wait up to 10 seconds for connection
      });

      console.log("MongoDB Connected Successfully");

      // Handle connection events
      mongoose.connection.on("error", handleConnectionError);
      mongoose.connection.on("disconnected", handleDisconnect);
      mongoose.connection.on("reconnected", handleReconnect);
    } catch (error) {
      console.error(
        `Error connecting to MongoDB (attempt ${retryCount + 1}):`,
        error,
      );

      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying connection in ${retryDelay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return connect();
      } else {
        console.error("Max connection attempts reached. Exiting...");
        process.exit(1);
      }
    }
  };

  return connect();
};

const handleConnectionError = (err: Error) => {
  console.error("MongoDB connection error:", err);
};

const handleDisconnect = () => {
  console.log("MongoDB disconnected");
};

const handleReconnect = () => {
  console.log("MongoDB reconnected");
};

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
});

export default connectDB;
