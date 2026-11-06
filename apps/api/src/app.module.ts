import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { GuestModule } from './guest/guest.module';
import { ConnectModule } from './connect/connect.module';
import { CreatorModule } from './creator/creator.module';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CatalogModule } from './catalog/catalog.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    HealthModule,
    GuestModule,
    ConnectModule,
    CreatorModule,
    AuthModule,
    SubscriptionsModule,
    CatalogModule,
  ],
})
export class AppModule {}
