import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { CreatorController } from './creator.controller';
import { CreatorService } from './creator.service';
import { R2Service } from '../r2/r2.service';
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
  controllers: [CreatorController],
  providers: [CreatorService, R2Service, GuestAuthGuard, RolesGuard],
})
export class CreatorModule {}
