import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { ConnectGateway } from './connect.gateway';
import { ConnectStore } from './connect.store';
import { VideoTokenController } from './video-token.controller';
import { GuestAuthGuard } from './guest-auth.guard';

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
  controllers: [VideoTokenController],
  providers: [ConnectStore, ConnectGateway, GuestAuthGuard],
})
export class ConnectModule {}
