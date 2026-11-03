import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { GuestModule } from './guest/guest.module';
import { ConnectModule } from './connect/connect.module';

@Module({
  imports: [ConfigModule, HealthModule, GuestModule, ConnectModule],
})
export class AppModule {}
