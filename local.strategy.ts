import { Injectable } from '@nestjs/common';
import { AutomationLoopService } from '../automation-loop.service';
import { OrchestrationStrategy } from './strategy.interface';

@Injectable()
export class LocalOrchestrationStrategy implements OrchestrationStrategy {
  constructor(private readonly automationLoop: AutomationLoopService) {}

  async triggerImpactAnalysis(eventId: string, summary: string) {
    // Directly calls your NestJS automation loop without Kafka
    // await this.automationLoop.runSynchronousWorkflow(eventId, summary);
  }
}