import { Controller, Post, Body } from '@nestjs/common';
import { RegulatoryIngestionService } from './ingestion.service';

@Controller('regulatory')
export class RegulatoryController {
  constructor(private ingestionService: RegulatoryIngestionService) {}

  @Post('webhook/regulatory-update')
  async handleScraperUpdate(@Body() body: any) {
    // 1. Ingest and Embed
    const result = await this.ingestionService.ingestNewRegulation(body);
    
    // 2. (Optional) If Kafka is enabled, emit an event for the Automation Controller
    if (process.env.KAFKA_ENABLED === 'true') {
       // Kafka production logic would go here
       // await this.kafkaProducer.send({...})
    }
    return result;
  }
}