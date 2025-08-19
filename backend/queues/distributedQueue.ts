import Queue from "bull";
import { EventEmitter } from "events";

interface JobData {
  type: string;
  payload: any;
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: number | string;
}

interface QueueConfig {
  name: string;
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  concurrency?: number;
  defaultJobOptions?: any;
}

class DistributedQueue extends EventEmitter {
  private queues: Map<string, Queue.Queue> = new Map();
  private processors: Map<string, (job: Queue.Job) => Promise<unknown>> =
    new Map();
  private config: QueueConfig;

  constructor(config: QueueConfig) {
    super();
    this.config = config;
  }

  // Create a new queue
  createQueue(name: string, concurrency?: number): Queue.Queue {
    if (this.queues.has(name)) {
      return this.queues.get(name)!;
    }

    const queue = new Queue(name, {
      redis: this.config.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        ...this.config.defaultJobOptions,
      },
    });

    // Set up queue event handlers
    this.setupQueueEvents(queue, name);

    // Set concurrency if specified
    if (concurrency) {
      queue.process(concurrency, this.processJob.bind(this));
    } else {
      queue.process(this.processJob.bind(this));
    }

    this.queues.set(name, queue);
    return queue;
  }

  private setupQueueEvents(queue: Queue.Queue, name: string) {
    queue.on("waiting", (job: Queue.Job) => {
      this.emit("job:waiting", {
        queue: name,
        jobId: job.id.toString(),
        data: job.data,
      });
    });

    queue.on("active", (job: Queue.Job) => {
      this.emit("job:active", {
        queue: name,
        jobId: job.id.toString(),
        data: job.data,
      });
    });

    queue.on("completed", (job: Queue.Job, result) => {
      this.emit("job:completed", {
        queue: name,
        jobId: job.id.toString(),
        data: job.data,
        result,
        duration: Date.now() - job.timestamp,
      });
    });

    queue.on("failed", (job: Queue.Job, err) => {
      this.emit("job:failed", {
        queue: name,
        jobId: job.id.toString(),
        data: job.data,
        error: err.message,
        attempts: job.attemptsMade,
      });
    });

    queue.on("stalled", (job: Queue.Job) => {
      this.emit("job:stalled", {
        queue: name,
        jobId: job.id.toString(),
        data: job.data,
      });
    });

    queue.on("error", (error) => {
      this.emit("queue:error", { queue: name, error: error.message });
    });
  }

  // Add a job to a queue
  async addJob(queueName: string, data: JobData): Promise<Queue.Job> {
    const queue = this.getOrCreateQueue(queueName);

    const jobOptions: any = {
      priority: data.priority || 0,
      attempts: data.attempts || 3,
      backoff: data.backoff || {
        type: "exponential",
        delay: 2000,
      },
    };

    if (data.delay) {
      jobOptions.delay = data.delay;
    }

    return await queue.add(data.type, data.payload, jobOptions);
  }

  // Add multiple jobs to a queue
  async addJobs(queueName: string, jobs: JobData[]): Promise<Queue.Job[]> {
    this.getOrCreateQueue(queueName);
    const addedJobs: Queue.Job[] = [];

    for (const jobData of jobs) {
      const job = await this.addJob(queueName, jobData);
      addedJobs.push(job);
    }

    return addedJobs;
  }

  // Register a job processor
  registerProcessor(
    queueName: string,
    jobType: string,
    processor: (job: Queue.Job) => Promise<unknown>,
  ): void {
    const key = `${queueName}:${jobType}`;
    this.processors.set(key, processor);
  }

  // Process a job
  private async processJob(job: Queue.Job): Promise<any> {
    const startTime = Date.now();
    const key = `${job.queue.name}:${job.data.type}`;
    const processor = this.processors.get(key);

    if (!processor) {
      throw new Error(`No processor registered for job type: ${job.data.type}`);
    }

    try {
      const result = await processor(job);
      const duration = Date.now() - startTime;

      this.emit("job:processed", {
        queue: job.queue.name,
        jobId: job.id.toString(),
        type: job.data.type,
        success: true,
        result,
        duration,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.emit("job:processed", {
        queue: job.queue.name,
        jobId: job.id.toString(),
        type: job.data.type,
        success: false,
        error: (error as Error).message,
        duration,
      });

      throw error;
    }
  }

  // Get or create a queue
  private getOrCreateQueue(name: string): Queue.Queue {
    if (!this.queues.has(name)) {
      return this.createQueue(name);
    }
    return this.queues.get(name)!;
  }

  // Get queue statistics
  async getQueueStats(queueName: string): Promise<any> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ]);

    return {
      name: queueName,
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total:
        waiting.length +
        active.length +
        completed.length +
        failed.length +
        delayed.length,
    };
  }

  // Get all queue statistics
  async getAllQueueStats(): Promise<any[]> {
    const stats = [];

    for (const [name] of this.queues) {
      try {
        const queueStats = await this.getQueueStats(name);
        stats.push(queueStats);
      } catch (error) {
        console.error(`Error getting stats for queue ${name}:`, error);
      }
    }

    return stats;
  }

  // Clean completed jobs
  async cleanQueue(
    queueName: string,
    grace: number = 1000 * 60 * 60 * 24,
  ): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.clean(grace, "completed");
    await queue.clean(grace, "failed");
  }

  // Pause a queue
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.pause();
  }

  // Resume a queue
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.resume();
  }

  // Remove a job
  async removeJob(queueName: string, jobId: string | number): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  // Retry a failed job
  async retryJob(queueName: string, jobId: string | number): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.getJob(jobId);
    if (job) {
      await job.retry();
    }
  }

  // Get job details
  async getJob(
    queueName: string,
    jobId: string | number,
  ): Promise<Queue.Job | null> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return await queue.getJob(jobId);
  }

  // Close all queues
  async close(): Promise<void> {
    const closePromises = Array.from(this.queues.values()).map((queue) =>
      queue.close(),
    );
    await Promise.all(closePromises);
    this.queues.clear();
  }
}

// Predefined queue types for common tasks
export class VehicleQueue extends DistributedQueue {
  constructor() {
    super({
      name: "vehicle-processing",
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
      },
      concurrency: 5,
    });

    this.setupVehicleProcessors();
  }

  private setupVehicleProcessors() {
    // Image processing
    this.registerProcessor(
      "vehicle-processing",
      "process-images",
      async (payload: any) => {
        // Process vehicle images
        console.log("Processing images for vehicle:", payload.vehicleId);
        // Implementation would include image optimization, resizing, etc.
        return { processed: true, images: payload.images };
      },
    );

    // Data indexing
    this.registerProcessor(
      "vehicle-processing",
      "index-data",
      async (payload: any) => {
        // Index vehicle data for search
        console.log("Indexing data for vehicle:", payload.vehicleId);
        // Implementation would include search indexing
        return { indexed: true };
      },
    );

    // Notification sending
    this.registerProcessor(
      "vehicle-processing",
      "send-notifications",
      async (payload: any) => {
        // Send notifications about new vehicles
        console.log("Sending notifications for vehicle:", payload.vehicleId);
        // Implementation would include push notifications, emails, etc.
        return { notificationsSent: true };
      },
    );
  }

  // Convenience methods for vehicle-specific jobs
  async processVehicleImages(
    vehicleId: string,
    images: string[],
  ): Promise<Queue.Job> {
    return await this.addJob("vehicle-processing", {
      type: "process-images",
      payload: { vehicleId, images },
      priority: 1,
    });
  }

  async indexVehicleData(vehicleId: string, data: any): Promise<Queue.Job> {
    return await this.addJob("vehicle-processing", {
      type: "index-data",
      payload: { vehicleId, data },
      priority: 2,
    });
  }

  async sendVehicleNotifications(
    vehicleId: string,
    subscribers: string[],
  ): Promise<Queue.Job> {
    return await this.addJob("vehicle-processing", {
      type: "send-notifications",
      payload: { vehicleId, subscribers },
      priority: 3,
      delay: 5000, // Delay by 5 seconds
    });
  }
}

export class AnalyticsQueue extends DistributedQueue {
  constructor() {
    super({
      name: "analytics-processing",
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
      },
      concurrency: 3,
    });

    this.setupAnalyticsProcessors();
  }

  private setupAnalyticsProcessors() {
    // Track page views
    this.registerProcessor(
      "analytics-processing",
      "track-pageview",
      async (payload: any) => {
        console.log("Tracking pageview:", payload);
        // Implementation would include analytics tracking
        return { tracked: true };
      },
    );

    // Generate reports
    this.registerProcessor(
      "analytics-processing",
      "generate-report",
      async (payload: any) => {
        console.log("Generating report:", payload);
        // Implementation would include report generation
        return { reportGenerated: true };
      },
    );

    // Process user behavior
    this.registerProcessor(
      "analytics-processing",
      "process-behavior",
      async (payload: any) => {
        console.log("Processing user behavior:", payload);
        // Implementation would include behavior analysis
        return { behaviorProcessed: true };
      },
    );
  }

  // Convenience methods for analytics jobs
  async trackPageView(
    page: string,
    userId?: string,
    metadata?: any,
  ): Promise<Queue.Job> {
    return await this.addJob("analytics-processing", {
      type: "track-pageview",
      payload: { page, userId, metadata, timestamp: Date.now() },
    });
  }

  async generateReport(type: string, dateRange: any): Promise<Queue.Job> {
    return await this.addJob("analytics-processing", {
      type: "generate-report",
      payload: { type, dateRange },
      priority: 1,
    });
  }
}

// Export instances
export const vehicleQueue = new VehicleQueue();
export const analyticsQueue = new AnalyticsQueue();

export default {
  vehicleQueue,
  analyticsQueue,
};
