import Queue from "bull";
import { EventEmitter } from "events";
import Redis from "ioredis";

// Interfaces para configuração de filas
interface QueueConfig {
  name: string;
  concurrency: number;
  priority: number;
  attempts: number;
  backoff: {
    type: "fixed" | "exponential";
    delay: number;
  };
  removeOnComplete: number;
  removeOnFail: number;
  delay?: number;
  repeat?: {
    cron: string;
    tz: string;
  };
}

interface JobData {
  type: string;
  payload: unknown;
  priority?: number;
  delay?: number;
  attempts?: number;
  metadata?: Record<string, unknown>;
}

interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  total: number;
  throughput: number;
  avgProcessingTime: number;
}

// Configurações padrão das filas
const QUEUE_CONFIGS: Record<string, QueueConfig> = {
  vehicle: {
    name: "vehicle",
    concurrency: 5,
    priority: 1,
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
  analytics: {
    name: "analytics",
    concurrency: 10,
    priority: 2,
    attempts: 2,
    backoff: { type: "fixed", delay: 1000 },
    removeOnComplete: 1000,
    removeOnFail: 100,
  },
  notification: {
    name: "notification",
    concurrency: 3,
    priority: 1,
    attempts: 5,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 25,
  },
  image: {
    name: "image",
    concurrency: 2,
    priority: 1,
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
  email: {
    name: "email",
    concurrency: 2,
    priority: 2,
    attempts: 3,
    backoff: { type: "exponential", delay: 10000 },
    removeOnComplete: 50,
    removeOnFail: 25,
  },
};

class QueueManager extends EventEmitter {
  private queues: Map<string, Queue.Queue> = new Map();
  private processors: Map<string, (job: Queue.Job) => Promise<unknown>> = new Map();
  private redis: Redis;
  private stats: Map<string, QueueStats> = new Map();
  private isShuttingDown = false;

  constructor(redisUrl?: string) {
    super();
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || "redis://localhost:6379");
    this.initializeQueues();
    this.setupGlobalEvents();
  }

  // Inicializar todas as filas
  private initializeQueues(): void {
    Object.values(QUEUE_CONFIGS).forEach((config) => {
      this.createQueue(config);
    });
  }

  // Criar uma nova fila
  private createQueue(config: QueueConfig): Queue.Queue {
    const queue = new Queue(config.name, {
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        priority: config.priority,
        attempts: config.attempts,
        backoff: config.backoff,
        removeOnComplete: config.removeOnComplete,
        removeOnFail: config.removeOnFail,
        delay: config.delay,
      },
    });

    // Configurar processamento
    queue.process(config.concurrency, this.processJob.bind(this));

    // Configurar eventos da fila
    this.setupQueueEvents(queue, config.name);

    // Configurar repetição se especificado
    if (config.repeat) {
      queue.add(
        "scheduled",
        {},
        {
          repeat: config.repeat,
        }
      );
    }

    this.queues.set(config.name, queue);
    this.stats.set(config.name, this.createEmptyStats(config.name));

    return queue;
  }

  // Configurar eventos globais
  private setupGlobalEvents(): void {
    process.on("SIGTERM", () => this.gracefulShutdown());
    process.on("SIGINT", () => this.gracefulShutdown());
  }

  // Configurar eventos de uma fila específica
  private setupQueueEvents(queue: Queue.Queue, queueName: string): void {
    queue.on("waiting", (job: Queue.Job) => {
      this.emit("job:waiting", {
        queue: queueName,
        jobId: job.id.toString(),
        data: job.data,
      });
      this.updateStats(queueName, "waiting", 1);
    });

    queue.on("active", (job: Queue.Job) => {
      this.emit("job:active", {
        queue: queueName,
        jobId: job.id.toString(),
        data: job.data,
      });
      this.updateStats(queueName, "active", 1);
    });

    queue.on("completed", (job: Queue.Job, result) => {
      const duration = Date.now() - job.timestamp;
      this.emit("job:completed", {
        queue: queueName,
        jobId: job.id.toString(),
        data: job.data,
        result,
        duration,
        attempts: job.attemptsMade,
      });
      this.updateStats(queueName, "completed", 1, duration);
    });

    queue.on("failed", (job: Queue.Job, err) => {
      const duration = Date.now() - job.timestamp;
      this.emit("job:failed", {
        queue: queueName,
        jobId: job.id.toString(),
        data: job.data,
        error: err.message,
        attempts: job.attemptsMade,
        duration,
      });
      this.updateStats(queueName, "failed", 1);
    });

    queue.on("stalled", (job: Queue.Job) => {
      this.emit("job:stalled", {
        queue: queueName,
        jobId: job.id.toString(),
        data: job.data,
      });
    });

    queue.on("error", (error) => {
      this.emit("queue:error", { queue: queueName, error: error.message });
    });

    queue.on("paused", () => {
      this.emit("queue:paused", { queue: queueName });
    });

    queue.on("resumed", () => {
      this.emit("queue:resumed", { queue: queueName });
    });
  }

  // Processar um job
  private async processJob(job: Queue.Job): Promise<unknown> {
    const startTime = Date.now();
    const queueName = job.queue.name;
    const jobType = job.data.type || "default";
    const processor = this.processors.get(`${queueName}:${jobType}`);

    if (!processor) {
      throw new Error(`No processor registered for job type: ${jobType} in queue: ${queueName}`);
    }

    try {
      const result = await processor(job);
      const duration = Date.now() - startTime;

      this.emit("job:processed", {
        queue: queueName,
        jobId: job.id,
        type: jobType,
        success: true,
        result,
        duration,
        attempts: job.attemptsMade,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.emit("job:processed", {
        queue: queueName,
        jobId: job.id,
        type: jobType,
        success: false,
        error: errorMessage,
        duration,
        attempts: job.attemptsMade,
      });

      throw error;
    }
  }

  // Registrar um processador para um tipo de job
  public registerProcessor(
    queueName: string,
    jobType: string,
    processor: (job: Queue.Job) => Promise<unknown>
  ): void {
    const key = `${queueName}:${jobType}`;
    this.processors.set(key, processor);
  }

  // Adicionar um job a uma fila
  public async addJob(queueName: string, data: JobData): Promise<Queue.Job> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const jobOptions: Queue.JobOptions = {
      priority: data.priority || QUEUE_CONFIGS[queueName]?.priority || 0,
      attempts: data.attempts || QUEUE_CONFIGS[queueName]?.attempts || 3,
      delay: data.delay || 0,
    };

    const job = await queue.add(data.type, data.payload, jobOptions);

    this.emit("job:added", {
      queue: queueName,
      jobId: job.id,
      type: data.type,
      data: data.payload,
    });

    return job;
  }

  // Adicionar múltiplos jobs
  public async addJobs(queueName: string, jobs: JobData[]): Promise<Queue.Job[]> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const jobPromises = jobs.map((data) => this.addJob(queueName, data));
    return Promise.all(jobPromises);
  }

  // Pausar uma fila
  public async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.pause();
    }
  }

  // Resumir uma fila
  public async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.resume();
    }
  }

  // Limpar uma fila
  public async cleanQueue(queueName: string, grace: number = 1000): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.clean(grace, "completed");
      await queue.clean(grace, "failed");
    }
  }

  // Obter estatísticas de uma fila
  public async getQueueStats(queueName: string): Promise<QueueStats | null> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      return null;
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ]);

    const stats = this.stats.get(queueName) || this.createEmptyStats(queueName);

    return {
      ...stats,
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total: waiting.length + active.length + completed.length + failed.length + delayed.length,
    };
  }

  // Obter estatísticas de todas as filas
  public async getAllQueueStats(): Promise<QueueStats[]> {
    const statsPromises = Array.from(this.queues.keys()).map((name) => this.getQueueStats(name));
    const stats = await Promise.all(statsPromises);
    return stats.filter((stat): stat is QueueStats => stat !== null);
  }

  // Obter jobs de uma fila
  public async getQueueJobs(
    queueName: string,
    status: string = "waiting",
    start = 0,
    end = 100
  ): Promise<Queue.Job[]> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      return [];
    }

    switch (status) {
      case "waiting":
        return queue.getWaiting(start, end);
      case "active":
        return queue.getActive(start, end);
      case "completed":
        return queue.getCompleted(start, end);
      case "failed":
        return queue.getFailed(start, end);
      case "delayed":
        return queue.getDelayed(start, end);
      default:
        return queue.getWaiting(start, end);
    }
  }

  // Remover um job
  public async removeJob(queueName: string, jobId: string | number): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      const job = await queue.getJob(jobId);
      if (job) {
        await job.remove();
      }
    }
  }

  // Retry um job
  public async retryJob(queueName: string, jobId: string | number): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      const job = await queue.getJob(jobId);
      if (job) {
        await job.retry();
      }
    }
  }

  // Shutdown graceful
  public async gracefulShutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    console.log("Starting graceful shutdown of queue manager...");

    // Pausar todas as filas
    const pausePromises = Array.from(this.queues.keys()).map((name) => this.pauseQueue(name));
    await Promise.all(pausePromises);

    // Aguardar jobs ativos terminarem
    const activeJobs = await Promise.all(
      Array.from(this.queues.values()).map((queue) => queue.getActive())
    );

    const totalActiveJobs = activeJobs.reduce((sum, jobs) => sum + jobs.length, 0);

    if (totalActiveJobs > 0) {
      console.log(`Waiting for ${totalActiveJobs} active jobs to complete...`);

      // Aguardar até 30 segundos
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        const currentActiveJobs = await Promise.all(
          Array.from(this.queues.values()).map((queue) => queue.getActive())
        );

        const currentTotal = currentActiveJobs.reduce((sum, jobs) => sum + jobs.length, 0);

        if (currentTotal === 0) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }
    }

    // Fechar todas as filas
    const closePromises = Array.from(this.queues.values()).map((queue) => queue.close());
    await Promise.all(closePromises);

    // Fechar conexão Redis
    await this.redis.quit();

    console.log("Queue manager shutdown completed");
    this.emit("shutdown:completed");
  }

  // Funções auxiliares
  private createEmptyStats(queueName: string): QueueStats {
    return {
      name: queueName,
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      paused: 0,
      total: 0,
      throughput: 0,
      avgProcessingTime: 0,
    };
  }

  private updateStats(
    queueName: string,
    field: keyof QueueStats,
    increment: number,
    duration?: number
  ): void {
    const stats = this.stats.get(queueName);
    if (stats) {
      (stats as any)[field] = (stats as any)[field] + increment;

      if (duration && field === "completed") {
        stats.avgProcessingTime = (stats.avgProcessingTime + duration) / 2;
      }
    }
  }

  // Health check
  public async healthCheck(): Promise<{
    status: string;
    queues: Record<string, boolean>;
  }> {
    const queueStatus: Record<string, boolean> = {};

    for (const [name, queue] of this.queues) {
      try {
        await queue.getJobCounts();
        queueStatus[name] = true;
      } catch (error) {
        queueStatus[name] = false;
      }
    }

    const allHealthy = Object.values(queueStatus).every((status) => status);

    return {
      status: allHealthy ? "healthy" : "unhealthy",
      queues: queueStatus,
    };
  }
}

// Instância singleton
export const queueManager = new QueueManager();

// Processadores padrão
queueManager.registerProcessor("vehicle", "process", async (job) => {
  const { payload } = job.data;
  console.log("Processing vehicle job:", payload);

  // Simular processamento
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { processed: true, data: payload };
});

queueManager.registerProcessor("analytics", "track", async (job) => {
  const { payload } = job.data;
  console.log("Tracking analytics:", payload);

  // Simular tracking
  await new Promise((resolve) => setTimeout(resolve, 500));

  return { tracked: true, data: payload };
});

queueManager.registerProcessor("notification", "send", async (job) => {
  const { payload } = job.data;
  console.log("Sending notification:", payload);

  // Simular envio de notificação
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return { sent: true, data: payload };
});

queueManager.registerProcessor("image", "optimize", async (job) => {
  const { payload } = job.data;
  console.log("Optimizing image:", payload);

  // Simular otimização de imagem
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return { optimized: true, data: payload };
});

queueManager.registerProcessor("email", "send", async (job) => {
  const { payload } = job.data;
  console.log("Sending email:", payload);

  // Simular envio de email
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return { sent: true, data: payload };
});

export default queueManager;
