import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { Specification } from '../specifications/entities/specification.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RegulatoryKnowledge } from '../regulatory/entities/regulatory-knowledge.entity';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Workspace)
    private workspaceRepo: Repository<Workspace>,

    @InjectRepository(Specification)
    private specRepo: Repository<Specification>,

    @InjectRepository(RegulatoryKnowledge)
    private regulatoryRepo: Repository<RegulatoryKnowledge>,

    @InjectQueue('compliance-updates')
    private complianceQueue: Queue,
  ) {}

  async countWorkspaces(): Promise<number> {
    return this.workspaceRepo.count({
      where: { isActive: true },
    });
  }

  async getActiveJobs(): Promise<number> {
    const [active, waiting] = await Promise.all([
      this.complianceQueue.getActiveCount(),
      this.complianceQueue.getWaitingCount(),
    ]);
    return active + waiting;
  }

  async getUnresolvedDrifts(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.specRepo
      .createQueryBuilder('spec')
      .where('spec.status = :status', { status: 'needs_update' })
      .andWhere('spec.lastRegulatoryCheck < :date', { date: sevenDaysAgo })
      .getCount();
  }

  async manualRetry(jobId: string) {
      // Implementation
      return { status: 'retried' };
  }
}