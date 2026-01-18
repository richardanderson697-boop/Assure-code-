import { Injectable } from '@nestjs/common';
import { Specification } from '../specifications/entities/specification.entity';
import { COMPLIANCE_UPGRADE_PROMPT } from './prompts/compliance-upgrade';

@Injectable()
export class GeminiGeneratorService {
  constructor(private geminiService: any) {} // Mock injection

  async generateProposedFix(spec: Specification, newLaw: string) {
    const prompt = COMPLIANCE_UPGRADE_PROMPT
      .replace('{currentSpec}', spec.content)
      .replace('{newLawContent}', newLaw);

    // Call Gemini-2.0-Flash (efficient for middle-tier reasoning)
    const response = await this.geminiService.generateText(prompt);

    if (response === 'NO_CHANGE_REQUIRED') {
      return null;
    }

    // VALIDATION: Ensure the AI actually cited a law
    const citationRegex = /\[.*Art\..*\]|\[.*Section.*\]/;
    if (!citationRegex.test(response)) {
      throw new Error("AI failed to provide legal citations. Regenerating...");
    }

    return response;
  }
}