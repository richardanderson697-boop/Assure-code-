import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LogsService {
  constructor(@InjectRepository('Log') private logsRepo: Repository<any>) {}

  async getAggregatedLogs(filters: { correlationId?: string; level?: string; limit?: number }) {
    const query = this.logsRepo.createQueryBuilder('log')
      .orderBy('log.timestamp', 'DESC')
      .limit(filters.limit || 50);

    if (filters.correlationId) {
      query.andWhere('log.correlationId = :id', { id: filters.correlationId });
    }

    return await query.getMany();
  }
}