import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { OrchestrationStrategy } from './strategy.interface';

@Injectable()
export class KafkaOrchestrationStrategy implements OrchestrationStrategy {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

  async triggerImpactAnalysis(eventId: string, summary: string) {
    // This triggers the Go Orchestrator (Tier 2/3)
    this.kafkaClient.emit('regulatory.new_event', { eventId, summary });
  }
}