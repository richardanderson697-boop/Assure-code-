import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegulatoryKnowledge } from './entities/regulatory-knowledge.entity';

@Injectable()
export class RegulatoryIngestionService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private readonly logger = new Logger(RegulatoryIngestionService.name);

  constructor(
    @InjectRepository(RegulatoryKnowledge)
    private readonly repository: Repository<RegulatoryKnowledge>,
  ) {}

  async ingestNewRegulation(data: {
    framework: string;
    article: string;
    content: string;
    url?: string;
  }) {
    this.logger.log(`Ingesting new regulation: ${data.framework} - ${data.article}`);

    // 1. Generate Vector Embedding for semantic search
    const embeddingResponse = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: data.content,
    });
    const vector = embeddingResponse.data[0].embedding;

    // 2. Store in the Vector Database (regulatory_knowledge table)
    await this.repository.query(
      `INSERT INTO regulatory_knowledge 
       (framework_name, article_number, content, embedding, metadata)
       VALUES ($1, $2, $3, $4::vector, $5)`,
      [
        data.framework, 
        data.article, 
        data.content, 
        JSON.stringify(vector), 
        { source_url: data.url, ingested_at: new Date().toISOString() }
      ]
    );

    return { status: 'success', framework: data.framework, article: data.article };
  }
}