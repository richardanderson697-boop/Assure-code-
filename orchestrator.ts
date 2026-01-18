import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class OrchestratorService {
  constructor(
      @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  async handleRegulatoryUpdate(eventId: string, summary: string) {
    const isKafkaEnabled = process.env.KAFKA_ENABLED === 'true';

    if (isKafkaEnabled) {
      // MODE A: Production (Kafka + Go Orchestrator)
      this.kafkaClient.emit('regulatory.new_event', { eventId, summary });
    } else {
      // MODE B: Market Test (Local Execution)
      // Directly trigger the generation and validation flow
      this.executeLocalWorkflow(eventId, summary);
    }
  }

  private async executeLocalWorkflow(eventId: string, summary: string) {
    // 1. Call Gemini Draft Service via HTTP
    // const draft = await this.httpService.post(process.env.GEMINI_URL, { summary });

    // 2. Call OpenAI Scanner Service via HTTP
    // const scanResult = await this.httpService.post(process.env.OPENAI_SCANNER_URL, { content: draft });

    // 3. Evaluate Threshold (The 90% Gold Standard)
    // if (scanResult.score >= 90) {
    //   await this.githubService.createCompliancePullRequest(workspaceId, title, draft);
    // }
  }
}