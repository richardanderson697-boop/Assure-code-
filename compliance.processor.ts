import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AutomationLoopService } from './automation-loop.service';

@Processor('compliance-updates')
export class ComplianceProcessor {
  constructor(private readonly automationService: AutomationLoopService) {}

  @Process('process-impact')
  async handleImpactAnalysis(job: Job) {
    const { eventId, summary } = job.data;
    
    // Asynchronous resilience: If this fails, BullMQ will 
    // retry based on the backoff strategy (e.g., exponential)
    try {
      await this.automationService.handleRegulatoryUpdate(eventId, summary);
    } catch (error) {
      // Job remains in 'failed' state for visibility in Admin Dashboard
      throw new Error(`Impact analysis failed: ${error.message}`);
    }
  }
}