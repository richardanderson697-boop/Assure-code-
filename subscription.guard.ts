import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '../../workspaces/entities/workspace.entity';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector, @InjectRepository(Workspace) private repo: Repository<Workspace>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    const workspace = await this.repo.findOne({ where: { ownerId: user.id } });

    if (workspace?.subscriptionStatus !== 'active') {
      throw new HttpException('Subscription required to access AI features', HttpStatus.PAYMENT_REQUIRED);
    }
    return true;
  }
}