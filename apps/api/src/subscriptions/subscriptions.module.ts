import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { GuestAuthGuard } from '../connect/guest-auth.guard';
import { RolesGuard } from '../connect/roles.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '4h') as any },
      }),
    }),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, GuestAuthGuard, RolesGuard],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
