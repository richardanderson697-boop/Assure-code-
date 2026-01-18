import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specification } from '../specifications/entities/specification.entity';
import { RagProcessorService } from '../rag/rag-processor.service';
import { GithubIntegrationService } from '../github/github-integration.service';

@Injectable()
export class AutomationSyncService {
    constructor(
        @InjectRepository(Specification) private specRepo: Repository<Specification>,
        private ragService: RagProcessorService,
        private githubService: GithubIntegrationService
    ) {}

  async handleRegulatoryUpdate(eventId: string, regulationSummary: string) {
    if (process.env.ASSURE_CODE_AUTO_SEND !== 'true') return;

    // 1. SELECTIVE SYNC: Only find specs that mention topics related to the new law
    // In production, you would perform a vector search here to find "Affected Specs"
    const affectedSpecs = await this.specRepo.find({ 
      where: { status: 'compliant' } 
    });

    for (const spec of affectedSpecs) {
      // 2. RAG REGENERATION: Generate the fix with citations
      const updatedContent = await this.ragService.generateVettedSpec(
        `Update this specification based on the following legal change: ${regulationSummary}`,
        spec.workspaceId
      );

      // 3. GITHUB PUSH: Create the PR for human oversight
      await this.githubService.createCompliancePullRequest(
        spec.workspaceId,
        `chore(compliance): auto-update for ${eventId}`,
        updatedContent
      );
    }
  }
}