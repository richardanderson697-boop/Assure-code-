import { Controller, Post, Body, Headers } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specification } from '../specifications/entities/specification.entity';

@Controller('webhooks/github')
export class GithubWebhookController {
  constructor(
      @InjectRepository(Specification)
      private specRepo: Repository<Specification>
  ) {}

  @Post('events')
  async handleGithubEvent(@Body() event: any, @Headers('x-hub-signature-256') signature: string) {
    // Verify signature for security...

    if (event.action === 'closed' && event.pull_request?.merged) {
      const branchName = event.pull_request.head.ref;
      
      // Update the spec status in the database based on the merged branch
      await this.specRepo.update(
        { last_automation_branch: branchName },
        { status: 'compliant', last_updated: new Date() }
      );
    }
    return { received: true };
  }
}