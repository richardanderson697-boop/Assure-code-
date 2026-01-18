import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { RegulatoryIngestionService } from './ingestion.service';

@Controller('webhooks/regulatory')
export class RegulatoryIngestionController {
  constructor(private readonly ingestionService: RegulatoryIngestionService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ApiKeyGuard) // Tier 1 Scraper Authentication
  async ingestNewRegulation(@Body() dto: any) {
    return await this.ingestionService.ingestNewRegulation(dto);
  }
}