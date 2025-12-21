import { registerAs } from '@nestjs/config';
import * as os from 'os';

export interface WorkerConfig {
  minThreads: number;
  maxThreads: number;
  idleTimeout: number;
  maxQueue: number;
  taskTimeout: number;
}

export default registerAs(
  'worker',
  (): WorkerConfig => ({
    minThreads: parseInt(process.env.WORKER_MIN_THREADS || '2', 10),
    maxThreads: parseInt(process.env.WORKER_MAX_THREADS || String(os.cpus().length), 10),
    idleTimeout: parseInt(process.env.WORKER_IDLE_TIMEOUT || '60000', 10),
    maxQueue: parseInt(process.env.WORKER_MAX_QUEUE || '100', 10),
    taskTimeout: parseInt(process.env.WORKER_TASK_TIMEOUT || '45000', 10),
  }),
);
