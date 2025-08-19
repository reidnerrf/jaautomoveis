import mongoose from "mongoose";

interface ShardConfig {
  name: string;
  url: string;
  weight: number;
  isReadOnly: boolean;
}

interface ReplicaConfig {
  primary: string;
  secondaries: string[];
  readPreference: "primary" | "secondary" | "nearest";
}

class DatabaseSharding {
  private shards: Map<string, mongoose.Connection> = new Map();
  private replicas: Map<string, ReplicaConfig> = new Map();
  private currentShardIndex = 0;
  private shardWeights: number[] = [];

  constructor() {
    this.initializeShards();
    this.initializeReplicas();
  }

  private async initializeShards() {
    const shardConfigs: ShardConfig[] = [
      {
        name: "shard-1",
        url:
          process.env.MONGODB_SHARD_1 ||
          "mongodb://localhost:27017/ja_automoveis_shard1",
        weight: 1,
        isReadOnly: false,
      },
      {
        name: "shard-2",
        url:
          process.env.MONGODB_SHARD_2 ||
          "mongodb://localhost:27018/ja_automoveis_shard2",
        weight: 1,
        isReadOnly: false,
      },
      {
        name: "shard-3",
        url:
          process.env.MONGODB_SHARD_3 ||
          "mongodb://localhost:27019/ja_automoveis_shard3",
        weight: 1,
        isReadOnly: false,
      },
    ];

    for (const config of shardConfigs) {
      try {
        const connection = await mongoose.createConnection(config.url, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });

        this.shards.set(config.name, connection);
        this.shardWeights.push(config.weight);

        console.log(`Connected to shard: ${config.name}`);
      } catch (error) {
        console.error(`Failed to connect to shard ${config.name}:`, error);
      }
    }
  }

  private async initializeReplicas() {
    const replicaConfigs: ReplicaConfig[] = [
      {
        primary:
          process.env.MONGODB_PRIMARY ||
          "mongodb://localhost:27017/ja_automoveis",
        secondaries: [
          process.env.MONGODB_SECONDARY_1 ||
            "mongodb://localhost:27020/ja_automoveis",
          process.env.MONGODB_SECONDARY_2 ||
            "mongodb://localhost:27021/ja_automoveis",
        ],
        readPreference: "nearest",
      },
    ];

    for (const config of replicaConfigs) {
      this.replicas.set("main", config);
    }
  }

  // Hash-based sharding
  private getShardByHash(key: string): mongoose.Connection | null {
    const hash = this.hashString(key);
    const shardNames = Array.from(this.shards.keys());
    const shardIndex = hash % shardNames.length;
    const shardName = shardNames[shardIndex];

    return this.shards.get(shardName) || null;
  }

  // Round-robin sharding
  private getShardByRoundRobin(): mongoose.Connection | null {
    const shardNames = Array.from(this.shards.keys());
    if (shardNames.length === 0) return null;

    this.currentShardIndex = (this.currentShardIndex + 1) % shardNames.length;
    const shardName = shardNames[this.currentShardIndex];

    return this.shards.get(shardName) || null;
  }

  // Weighted sharding
  private getShardByWeight(): mongoose.Connection | null {
    const shardNames = Array.from(this.shards.keys());
    if (shardNames.length === 0) return null;

    const totalWeight = this.shardWeights.reduce(
      (sum, weight) => sum + weight,
      0,
    );
    let random = Math.random() * totalWeight;

    for (let i = 0; i < shardNames.length; i++) {
      random -= this.shardWeights[i];
      if (random <= 0) {
        return this.shards.get(shardNames[i]) || null;
      }
    }

    return this.shards.get(shardNames[0]) || null;
  }

  // Get shard based on strategy
  public getShard(
    strategy: "hash" | "roundRobin" | "weight",
    key?: string,
  ): mongoose.Connection | null {
    switch (strategy) {
      case "hash":
        return key ? this.getShardByHash(key) : null;
      case "roundRobin":
        return this.getShardByRoundRobin();
      case "weight":
        return this.getShardByWeight();
      default:
        return this.getShardByRoundRobin();
    }
  }

  // Get replica connection
  public async getReplicaConnection(
    replicaName: string = "main",
  ): Promise<mongoose.Connection | null> {
    const replicaConfig = this.replicas.get(replicaName);
    if (!replicaConfig) return null;

    try {
      const connection = await mongoose.createConnection(
        replicaConfig.primary,
        {
          maxPoolSize: 10,
          readPreference: replicaConfig.readPreference,
          replicaSet: "rs0",
        },
      );

      return connection;
    } catch (error) {
      console.error("Failed to connect to replica:", error);
      return null;
    }
  }

  // Shard-specific operations
  public async createVehicle(
    vehicleData: any,
    shardStrategy: "hash" | "roundRobin" | "weight" = "hash",
  ): Promise<any> {
    const shard = this.getShard(
      shardStrategy,
      vehicleData.id || vehicleData._id,
    );
    if (!shard) {
      throw new Error("No available shard");
    }

    // Create model on specific shard
    const VehicleModel = shard.model("Vehicle", this.getVehicleSchema());
    return await VehicleModel.create(vehicleData);
  }

  public async findVehicle(
    vehicleId: string,
    shardStrategy: "hash" | "roundRobin" | "weight" = "hash",
  ): Promise<any> {
    const shard = this.getShard(shardStrategy, vehicleId);
    if (!shard) {
      throw new Error("No available shard");
    }

    const VehicleModel = shard.model("Vehicle", this.getVehicleSchema());
    return await VehicleModel.findById(vehicleId);
  }

  // Cross-shard operations
  public async findVehiclesAcrossShards(
    query: any,
    limit: number = 100,
  ): Promise<any[]> {
    const results: any[] = [];
    const promises: Promise<any[]>[] = [];

    // Query all shards in parallel
    for (const [, shard] of this.shards) {
      const VehicleModel = shard.model("Vehicle", this.getVehicleSchema());
      promises.push(VehicleModel.find(query).limit(limit).lean());
    }

    const shardResults = await Promise.all(promises);

    // Combine and sort results
    for (const shardResult of shardResults) {
      results.push(...shardResult);
    }

    // Sort by creation date (newest first)
    return results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  // Aggregation across shards
  public async aggregateAcrossShards(pipeline: any[]): Promise<any[]> {
    const results: any[] = [];
    const promises: Promise<any[]>[] = [];

    // Run aggregation on all shards
    for (const [, shard] of this.shards) {
      const VehicleModel = shard.model("Vehicle", this.getVehicleSchema());
      promises.push(VehicleModel.aggregate(pipeline));
    }

    const shardResults = await Promise.all(promises);

    // Combine results
    for (const shardResult of shardResults) {
      results.push(...shardResult);
    }

    return results;
  }

  // Backup and restore operations
  public async backupShard(shardName: string): Promise<string> {
    const shard = this.shards.get(shardName);
    if (!shard) {
      throw new Error(`Shard ${shardName} not found`);
    }

    const backupPath = `/backups/${shardName}_${Date.now()}.gz`;

    // Implement backup logic here
    console.log(`Backing up shard ${shardName} to ${backupPath}`);

    return backupPath;
  }

  public async restoreShard(
    shardName: string,
    backupPath: string,
  ): Promise<void> {
    const shard = this.shards.get(shardName);
    if (!shard) {
      throw new Error(`Shard ${shardName} not found`);
    }

    // Implement restore logic here
    console.log(`Restoring shard ${shardName} from ${backupPath}`);
  }

  // Health check
  public async checkShardHealth(): Promise<Map<string, boolean>> {
    const healthStatus = new Map<string, boolean>();

    for (const [shardName, shard] of this.shards) {
      try {
        if (shard.db) {
          await shard.db.admin().ping();
          healthStatus.set(shardName, true);
        } else {
          healthStatus.set(shardName, false);
        }
      } catch (error) {
        healthStatus.set(shardName, false);
        console.error(`Shard ${shardName} health check failed:`, error);
      }
    }

    return healthStatus;
  }

  // Load balancing
  public async rebalanceShards(): Promise<void> {
    console.log("Starting shard rebalancing...");

    // Get data distribution
    const distribution = await this.getDataDistribution();

    // Calculate optimal distribution
    const optimalDistribution = this.calculateOptimalDistribution(distribution);

    // Execute rebalancing
    await this.executeRebalancing(distribution, optimalDistribution);

    console.log("Shard rebalancing completed");
  }

  // Utility functions
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private getVehicleSchema(): mongoose.Schema {
    return new mongoose.Schema({
      name: String,
      price: Number,
      make: String,
      model: String,
      year: Number,
      km: Number,
      color: String,
      gearbox: String,
      fuel: String,
      doors: Number,
      additionalInfo: String,
      optionals: [String],
      images: [String],
      views: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });
  }

  private async getDataDistribution(): Promise<Map<string, number>> {
    const distribution = new Map<string, number>();

    for (const [shardName, shard] of this.shards) {
      try {
        const VehicleModel = shard.model("Vehicle", this.getVehicleSchema());
        const count = await VehicleModel.countDocuments();
        distribution.set(shardName, count);
      } catch (error) {
        distribution.set(shardName, 0);
      }
    }

    return distribution;
  }

  private calculateOptimalDistribution(
    currentDistribution: Map<string, number>,
  ): Map<string, number> {
    const totalDocuments = Array.from(currentDistribution.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
    const shardCount = currentDistribution.size;
    const optimalPerShard = Math.ceil(totalDocuments / shardCount);

    const optimalDistribution = new Map<string, number>();
    for (const [shardName] of currentDistribution) {
      optimalDistribution.set(shardName, optimalPerShard);
    }

    return optimalDistribution;
  }

  private async executeRebalancing(
    _currentDistribution: Map<string, number>,
    _optimalDistribution: Map<string, number>,
  ): Promise<void> {
    // Implement actual rebalancing logic
    // This would involve moving documents between shards
    console.log("Executing rebalancing...");
  }

  // Cleanup
  public async closeAllConnections(): Promise<void> {
    for (const [, shard] of this.shards) {
      await shard.close();
    }
  }
}

export const databaseSharding = new DatabaseSharding();
export default databaseSharding;
