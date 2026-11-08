import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization as string | undefined;
    const token = auth?.replace('Bearer ', '');
    if (!token) return true; // public access
    try {
      const payload = await this.jwt.verifyAsync<any>(token);
      req.user = { userId: payload.sub, alias: payload.alias, role: payload.role };
    } catch {
      // invalid token — treat as anonymous
    }
    return true;
  }
}
