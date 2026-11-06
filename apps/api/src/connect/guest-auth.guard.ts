import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type JwtPayload = { sub: string; alias: string; role: string; ageLevel: string };

@Injectable()
export class GuestAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization as string | undefined;
    const token = auth?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException({ code: 'UNAUTHENTICATED' });
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      req.user = {
        userId: payload.sub,
        alias: payload.alias,
        role: payload.role,
        ageLevel: payload.ageLevel,
      };
      return true;
    } catch {
      throw new UnauthorizedException({ code: 'UNAUTHENTICATED' });
    }
  }
}
