import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AdminQueueService {
  constructor(@InjectQueue('compliance-updates') private queue: Queue) {}

  async getQueueSnapshot() {
    const [waiting, active, failed] = await Promise.all([
      this.queue.getWaiting(),
      this.queue.getActive(),
      this.queue.getFailed(),
    ]);

    return [...active, ...waiting, ...failed].map(job => ({
      id: job.id,
      status: job.getState(), // BullMQ state
      data: job.data,
      attemptsMade: job.attemptsMade,
    }));
  }
}