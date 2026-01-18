import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '../workspaces/entities/workspace.entity';

@Injectable()
export class RepoMappingService {
  constructor(
    @InjectRepository(Workspace) 
    private workspaceRepo: Repository<Workspace>
  ) {}

  async getRepositoryMapping(workspaceId: string) {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
      select: ['github_repo_owner', 'github_repo_name', 'default_branch']
    });

    if (!workspace?.github_repo_owner || !workspace?.github_repo_name) {
      throw new Error(`No GitHub repository mapped for workspace ${workspaceId}`);
    }

    return {
      owner: workspace.github_repo_owner,
      repo: workspace.github_repo_name,
      base: workspace.default_branch
    };
  }
}