import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('admin/control')
export class AdminControlController {
  constructor(
    @InjectQueue('compliance-updates') private complianceQueue: Queue
  ) {}

  @Post('kill-switch')
  async toggleGlobalAutomation(@Body() { action }: { action: 'pause' | 'resume' }) {
    if (action === 'pause') {
      // Globally pauses the queue across all distributed workers
      await this.complianceQueue.pause();
      return { status: 'EMERGENCY_STOP_ACTIVE', timestamp: new Date() };
    } else {
      await this.complianceQueue.resume();
      return { status: 'SYSTEM_RESUMED', timestamp: new Date() };
    }
  }
}