import { Injectable, Inject } from '@nestjs/common';
import { OrchestrationStrategy } from '../automation/strategies/strategy.interface';

@Injectable()
export class HybridIngestService {
  constructor(
      @Inject('ORCHESTRATION_STRATEGY') private orchestrator: OrchestrationStrategy
  ) {}

  async ingest(data: any) {
    const result = { id: '123' }; // await this.processAndStore(data);
    
    // The strategy decides: Kafka event OR Direct API call
    await this.orchestrator.triggerImpactAnalysis(result.id, data.content);
  }
}