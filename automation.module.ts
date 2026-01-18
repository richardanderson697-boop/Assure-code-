import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaOrchestrationStrategy } from './strategies/kafka.strategy';
import { LocalOrchestrationStrategy } from './strategies/local.strategy';

@Module({
  providers: [
    {
      provide: 'ORCHESTRATION_STRATEGY',
      useFactory: (configService: ConfigService, kafka: KafkaOrchestrationStrategy, local: LocalOrchestrationStrategy) => {
        return configService.get('KAFKA_ENABLED') === 'true' ? kafka : local;
      },
      inject: [ConfigService, KafkaOrchestrationStrategy, LocalOrchestrationStrategy],
    },
  ],
})
export class AutomationModule {}