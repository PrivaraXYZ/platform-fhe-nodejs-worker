import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import * as os from 'os';
import { fheConfig, workerConfig } from '@infrastructure/config';
import { FheModule } from '@infrastructure/fhe';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [fheConfig, workerConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),

        WORKER_MIN_THREADS: Joi.number().min(1).default(2),
        WORKER_MAX_THREADS: Joi.number().min(1).default(os.cpus().length),
        WORKER_IDLE_TIMEOUT: Joi.number().min(1000).default(60000),
        WORKER_MAX_QUEUE: Joi.number().min(1).default(100),
        WORKER_TASK_TIMEOUT: Joi.number().min(1000).default(45000),

        FHE_CHAIN_ID: Joi.number().default(11155111),
        FHE_NETWORK_NAME: Joi.string().default('Ethereum Sepolia'),
        FHE_NETWORK_URL: Joi.string().default('https://eth-sepolia.public.blastapi.io'),
        FHE_GATEWAY_URL: Joi.string().default('https://relayer.testnet.zama.org'),
        FHE_ACL_ADDRESS: Joi.string().default('0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D'),
        FHE_KMS_ADDRESS: Joi.string().default('0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A'),
      }),
    }),
    FheModule,
  ],
})
export class AppModule {}
