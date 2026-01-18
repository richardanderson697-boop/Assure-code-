import { Injectable } from '@nestjs/common';
import { SemanticFilterService } from '../rag/semantic-filter.service';

@Injectable()
export class ImpactAnalyzer {
  constructor(private semanticFilter: SemanticFilterService) {}

  async onNewRegulationIngested(regulationEmbedding: number[], rawContent: string, workspaceId: string) {
    // 1. Filter: Which specs actually care about this?
    const targets = await this.semanticFilter.findImpactedSpecs(regulationEmbedding, workspaceId);
    
    if (targets.length === 0) {
      console.log("No specifications impacted by this change. Skipping update.");
      return;
    }

    // 2. Loop only through the impacted ones
    for (const spec of targets) {
      // await this.triggerDraftGeneration(spec, rawContent);
    }
  }
}