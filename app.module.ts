import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { SpecificationsModule } from './specifications/specifications.module';
import { RagEngineModule } from './rag-engine/rag-engine.module';
import { RegulatoryModule } from './regulatory/regulatory.module';
import { GithubModule } from './github/github.module';
import { BillingModule } from './billing/billing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    SupabaseModule,
    AuthModule,
    WorkspacesModule,
    SpecificationsModule,
    RagEngineModule,
    RegulatoryModule,
    GithubModule,
    BillingModule,
    NotificationsModule,
    AuditModule,
  ],
})
export class AppModule {}