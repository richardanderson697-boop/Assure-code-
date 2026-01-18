import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RagProcessorService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(@InjectRepository('RegulatoryKnowledge') private repository: Repository<any>) {}

  async generateVettedSpec(userInput: string, workspaceId: string) {
    // 1. Generate Embedding for the User Request
    const embeddingResponse = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: userInput,
    });
    const vector = embeddingResponse.data[0].embedding;

    // 2. Perform Semantic Search in pgvector
    const relevantLaws = await this.findRelevantLaws(vector);

    // 3. Construct Augmented Prompt
    const prompt = this.buildCompliancePrompt(userInput, relevantLaws);

    // 4. Generate the Specification with Citations
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.2, // Low temperature for high precision/compliance
    });

    return completion.choices[0].message.content;
  }

  private async findRelevantLaws(vector: number[]) {
    // We use a raw query to leverage pgvector's cosine distance operator (<=>)
    return await this.repository.query(
      `SELECT framework_name, article_number, content 
       FROM regulatory_knowledge 
       ORDER BY embedding <=> $1::vector 
       LIMIT 5`,
      [JSON.stringify(vector)]
    );
  }

  private buildCompliancePrompt(input: string, laws: any[]) {
    return `
      You are the Assure Code Compliance Architect. 
      Analyze the following User Requirements: "${input}"

      Referencing these retrieved laws:
      ${laws.map(l => `[${l.framework_name} ${l.article_number}]: ${l.content}`).join('\n')}

      TASK:
      Generate a technical specification. For every security or privacy control 
      you recommend, you MUST cite the specific Law/Article above. 
      Follow the SOC 2 and GDPR standards defined in the Master Spec.
    `;
  }
}