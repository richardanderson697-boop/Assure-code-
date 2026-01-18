import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specification } from '../specifications/entities/specification.entity';

@Injectable()
export class SemanticFilterService {
  constructor(
    @InjectRepository(Specification)
    private specRepo: Repository<Specification>,
  ) {}

  async findImpactedSpecs(regulationVector: number[], workspaceId: string): Promise<Specification[]> {
    // We use a raw query because TypeORM doesn't natively support the <=> operator yet
    const vectorString = `[${regulationVector.join(',')}]`;
    
    const impactedSpecs = await this.specRepo.query(`
      SELECT * FROM (
        SELECT *, (1 - (embedding <=> $1::vector)) as score 
        FROM specifications 
        WHERE workspace_id = $2
      ) sub
      WHERE score > 0.78
      ORDER BY score DESC
    `, [vectorString, workspaceId]);

    return impactedSpecs;
  }
}