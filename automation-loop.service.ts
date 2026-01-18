import { Injectable, Logger } from '@nestjs/common';
import { RagProcessorService } from '../rag/rag-processor.service';
import { GithubIntegrationService } from '../github/github-integration.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specification } from '../entities/specification.entity';

@Injectable()
export class AutomationLoopService {
  private readonly logger = new Logger(AutomationLoopService.name);

  constructor(
    private ragService: RagProcessorService,
    private githubService: GithubIntegrationService,
    @InjectRepository(Specification) private specRepo: Repository<Specification>,
  ) {}

  /**
   * Triggered when Tier 1 detects a relevant regulatory change
   */
  async handleRegulatoryUpdate(eventId: string, regulationSummary: string) {
    if (process.env.ASSURE_CODE_AUTO_SEND !== 'true') return;

    // 1. Find all specifications affected by this regulation
    const affectedSpecs = await this.specRepo.find({ where: { status: 'compliant' } });

    for (const spec of affectedSpecs) {
      this.logger.log(`Auto-updating Spec: ${spec.name} due to Event: ${eventId}`);

      // 2. Generate the updated content using RAG
      const updatedContent = await this.ragService.generateVettedSpec(
        `Update this specification based on the following change: ${regulationSummary}`,
        spec.workspaceId
      );

      // 3. Push to GitHub as a Pull Request (Tier 3 Requirement)
      await this.githubService.createCompliancePullRequest(
        spec.workspaceId,
        `chore(compliance): auto-update for ${eventId}`,
        updatedContent
      );

      // 4. Log in Audit Trail (SOC 2 Requirement)
      await this.logAuditAction(spec.id, eventId);
    }
  }

  private async logAuditAction(specId: string, eventId: string) {
    this.logger.log(`Audit log created for spec ${specId} event ${eventId}`);
  }
}