import { Injectable, Logger } from '@nestjs/common';
import { AutomationLoopService } from '../automation/automation-loop.service';
import { Repository } from 'typeorm';
import { RegulatoryKnowledge } from './entities/regulatory-knowledge.entity';

@Injectable()
export class RegulatorySyncService {
  constructor(
    private readonly automationLoop: AutomationLoopService,
  ) {}

  async processAndSync(data: any) {
    // ... (Previous embedding and DB insertion logic would be called here)
    const newRegulationId = 'mock-id'; // retrieved from DB
    const summaryForAI = data.content;

    // TRIGGER KNOWLEDGE SYNC: Start the automation loop
    await this.automationLoop.handleRegulatoryUpdate(
      newRegulationId, 
      summaryForAI
    );

    return { status: 'sync_initiated', id: newRegulationId };
  }
}