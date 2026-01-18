import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { RegulatoryIngestionService } from '../regulatory/ingestion.service';

@Controller('webhooks/regulatory')
export class RegulatoryWebhookController {
  constructor(private ingestionService: RegulatoryIngestionService) {}

  @Post('new-event')
  @UseGuards(ApiKeyGuard) // Secure with Tier 1 API Key
  async handleNewRegulation(@Body() payload: any) {
    // 1. Process and embed the new law
    const result = await this.ingestionService.ingestNewRegulation({
      framework: payload.framework,
      article: payload.article_number,
      content: payload.raw_text,
      url: payload.source_url
    });

    // 2. Trigger the Automation Loop (Tier 2)
    return { status: 'ingested', eventId: result.id };
  }
}