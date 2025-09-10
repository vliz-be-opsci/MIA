import { WorkerTask, WorkerResponse, WorkerMessage, WorkerResponseMessage } from './DataCollectionWorker';

export interface WorkerPoolConfig {
  maxWorkers: number;
  maxQueueSize: number;
  workerIdleTimeout: number;
}

interface ManagedWorker {
  id: string;
  worker: Worker;
  busy: boolean;
  lastUsed: number;
  taskCount: number;
}

interface QueuedTask {
  task: WorkerTask;
  resolve: (response: WorkerResponse) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

export class WorkerPoolManager {
  private config: WorkerPoolConfig;
  private workers: Map<string, ManagedWorker> = new Map();
  private taskQueue: QueuedTask[] = [];
  private nextWorkerId: number = 0;
  private workerScript: string | null = null;
  private performanceMetrics = {
    tasksCompleted: 0,
    tasksQueued: 0,
    averageTaskTime: 0,
    activeWorkers: 0,
    queueLength: 0
  };

  constructor(config?: Partial<WorkerPoolConfig>) {
    this.config = {
      maxWorkers: Math.max(2, Math.min(navigator.hardwareConcurrency || 4, 8)),
      maxQueueSize: 100,
      workerIdleTimeout: 30000, // 30 seconds
      ...config
    };

    // Start periodic cleanup of idle workers
    setInterval(() => this.cleanupIdleWorkers(), 10000);
  }

  /**
   * Initialize the worker pool with a worker script
   */
  async initialize(workerScriptPath?: string): Promise<void> {
    if (workerScriptPath) {
      this.workerScript = workerScriptPath;
    } else {
      // Create inline worker script for the data collection worker
      this.workerScript = this.createInlineWorkerScript();
    }
  }

  /**
   * Submit a task to be processed by a worker
   */
  async submitTask(task: WorkerTask): Promise<WorkerResponse> {
    return new Promise((resolve, reject) => {
      // Check queue size limit
      if (this.taskQueue.length >= this.config.maxQueueSize) {
        reject(new Error('Worker pool queue is full'));
        return;
      }

      const queuedTask: QueuedTask = {
        task,
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.taskQueue.push(queuedTask);
      this.performanceMetrics.tasksQueued++;
      this.performanceMetrics.queueLength = this.taskQueue.length;

      // Try to process the task immediately
      this.processNextTask();
    });
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): any {
    return {
      ...this.performanceMetrics,
      activeWorkers: Array.from(this.workers.values()).filter(w => w.busy).length,
      totalWorkers: this.workers.size,
      queueLength: this.taskQueue.length
    };
  }

  /**
   * Shutdown the worker pool
   */
  async shutdown(): Promise<void> {
    // Terminate all workers
    for (const managedWorker of this.workers.values()) {
      this.terminateWorker(managedWorker);
    }
    this.workers.clear();

    // Reject all queued tasks
    for (const queuedTask of this.taskQueue) {
      queuedTask.reject(new Error('Worker pool is shutting down'));
    }
    this.taskQueue = [];
  }

  private async processNextTask(): Promise<void> {
    if (this.taskQueue.length === 0) {
      return;
    }

    // Try to get an available worker
    const worker = this.getAvailableWorker();
    if (!worker) {
      // No available workers, try to create a new one
      if (this.workers.size < this.config.maxWorkers) {
        const newWorker = await this.createWorker();
        if (newWorker) {
          this.assignTaskToWorker(newWorker);
        }
      }
      // If we can't create a new worker, the task will wait in the queue
      return;
    }

    this.assignTaskToWorker(worker);
  }

  private getAvailableWorker(): ManagedWorker | null {
    for (const worker of this.workers.values()) {
      if (!worker.busy) {
        return worker;
      }
    }
    return null;
  }

  private async createWorker(): Promise<ManagedWorker | null> {
    if (!this.workerScript) {
      console.error('Worker script not initialized');
      return null;
    }

    try {
      const workerId = `worker-${this.nextWorkerId++}`;
      const worker = new Worker(this.workerScript);
      
      const managedWorker: ManagedWorker = {
        id: workerId,
        worker,
        busy: false,
        lastUsed: Date.now(),
        taskCount: 0
      };

      // Set up worker event handlers
      worker.onmessage = (event: MessageEvent<WorkerResponseMessage>) => {
        this.handleWorkerMessage(managedWorker, event.data);
      };

      worker.onerror = (error) => {
        console.error(`Worker ${workerId} error:`, error);
        this.handleWorkerError(managedWorker, error);
      };

      this.workers.set(workerId, managedWorker);
      return managedWorker;

    } catch (error) {
      console.error('Failed to create worker:', error);
      return null;
    }
  }

  private assignTaskToWorker(worker: ManagedWorker): void {
    const queuedTask = this.taskQueue.shift();
    if (!queuedTask) {
      return;
    }

    worker.busy = true;
    worker.lastUsed = Date.now();
    worker.taskCount++;
    this.performanceMetrics.queueLength = this.taskQueue.length;

    // Store the task promise handlers for this worker
    (worker as any).currentTask = queuedTask;

    // Send task to worker
    const message: WorkerMessage = {
      type: 'COLLECT_INFO',
      task: queuedTask.task
    };
    
    worker.worker.postMessage(message);
  }

  private handleWorkerMessage(worker: ManagedWorker, message: WorkerResponseMessage): void {
    switch (message.type) {
      case 'TASK_COMPLETE':
        this.handleTaskComplete(worker, message.response);
        break;
        
      case 'READY':
        console.log(`Worker ${worker.id} is ready`);
        break;
        
      case 'ERROR':
        this.handleWorkerError(worker, new Error(message.error));
        break;
        
      case 'PONG':
        // Health check response
        break;
    }
  }

  private handleTaskComplete(worker: ManagedWorker, response: WorkerResponse): void {
    const currentTask = (worker as any).currentTask as QueuedTask;
    if (currentTask) {
      // Update performance metrics
      this.performanceMetrics.tasksCompleted++;
      const taskTime = response.processingTime;
      
      if (this.performanceMetrics.averageTaskTime === 0) {
        this.performanceMetrics.averageTaskTime = taskTime;
      } else {
        this.performanceMetrics.averageTaskTime = 
          (this.performanceMetrics.averageTaskTime * 0.9) + (taskTime * 0.1);
      }

      // Resolve the task promise
      if (response.success) {
        currentTask.resolve(response);
      } else {
        currentTask.reject(new Error(response.error || 'Unknown worker error'));
      }

      // Mark worker as available
      worker.busy = false;
      worker.lastUsed = Date.now();
      delete (worker as any).currentTask;

      // Process next task if available
      this.processNextTask();
    }
  }

  private handleWorkerError(worker: ManagedWorker, error: Error | ErrorEvent): void {
    console.error(`Worker ${worker.id} error:`, error);
    
    const currentTask = (worker as any).currentTask as QueuedTask;
    if (currentTask) {
      currentTask.reject(new Error(`Worker error: ${error}`));
      delete (worker as any).currentTask;
    }

    // Remove the problematic worker
    this.terminateWorker(worker);
    this.workers.delete(worker.id);

    // Process next task (will create new worker if needed)
    this.processNextTask();
  }

  private terminateWorker(worker: ManagedWorker): void {
    try {
      const message: WorkerMessage = { type: 'TERMINATE' };
      worker.worker.postMessage(message);
      worker.worker.terminate();
    } catch (error) {
      console.error(`Error terminating worker ${worker.id}:`, error);
    }
  }

  private cleanupIdleWorkers(): void {
    const now = Date.now();
    const workersToRemove: string[] = [];

    for (const [id, worker] of this.workers.entries()) {
      if (!worker.busy && (now - worker.lastUsed) > this.config.workerIdleTimeout) {
        workersToRemove.push(id);
      }
    }

    for (const id of workersToRemove) {
      const worker = this.workers.get(id);
      if (worker) {
        this.terminateWorker(worker);
        this.workers.delete(id);
      }
    }
  }

  private createInlineWorkerScript(): string {
    // Create a blob URL for the worker script
    // This is a simplified approach - in production, you'd likely have a separate worker file
    const workerCode = `
      // Minimal inline worker for data collection
      class SimpleDataCollectionWorker {
        async handleMessage(event) {
          const { type } = event.data;
          
          switch (type) {
            case 'COLLECT_INFO':
              await this.handleCollectInfo(event.data.task);
              break;
            case 'PING':
              self.postMessage({ type: 'PONG' });
              break;
            case 'TERMINATE':
              self.close();
              break;
          }
        }
        
        async handleCollectInfo(task) {
          const startTime = Date.now();
          
          try {
            // Simulate data collection
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
            
            const response = {
              id: task.id,
              success: true,
              data: { url: task.url, result: 'simulated data' },
              processingTime: Date.now() - startTime
            };
            
            self.postMessage({ type: 'TASK_COMPLETE', response });
          } catch (error) {
            self.postMessage({ 
              type: 'TASK_COMPLETE', 
              response: {
                id: task.id,
                success: false,
                error: error.message,
                processingTime: Date.now() - startTime
              }
            });
          }
        }
      }
      
      const worker = new SimpleDataCollectionWorker();
      self.addEventListener('message', event => worker.handleMessage(event));
      self.postMessage({ type: 'READY' });
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
  }
}