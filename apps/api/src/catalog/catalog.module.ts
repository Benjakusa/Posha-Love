import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { GuestAuthGuard } from '../connect/guest-auth.guard';
import { OptionalAuthGuard } from '../connect/optional-auth.guard';

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
  controllers: [CatalogController],
  providers: [CatalogService, GuestAuthGuard, OptionalAuthGuard],
})
export class CatalogModule {}
