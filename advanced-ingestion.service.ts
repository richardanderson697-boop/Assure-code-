import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegulatoryKnowledge } from './entities/regulatory-knowledge.entity';

@Injectable()
export class AdvancedIngestionService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private readonly logger = new Logger(AdvancedIngestionService.name);

  constructor(
    @InjectRepository(RegulatoryKnowledge)
    private readonly repo: Repository<RegulatoryKnowledge>,
  ) {}

  async processAndStore(data: any) {
    this.logger.log(`Ingesting: ${data.framework} - ${data.article}`);

    // 1. Generate Vector Embedding (OpenAI text-embedding-3-small)
    const embeddingResponse = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: data.content,
    });
    const vector = embeddingResponse.data[0].embedding;

    // 2. Persist to pgvector-enabled Supabase table
    const record = await this.repo.query(
      `INSERT INTO regulatory_knowledge 
       (framework_name, article_number, content, embedding, metadata)
       VALUES ($1, $2, $3, $4::vector, $5)
       RETURNING id`,
      [
        data.framework,
        data.article,
        data.content,
        JSON.stringify(vector),
        { source_url: data.url, ingested_at: new Date() }
      ]
    );

    return { status: 'success', id: record[0].id };
  }
}