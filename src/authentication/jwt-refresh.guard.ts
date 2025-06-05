import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {
  // This guard uses the 'jwt-refresh-token' strategy to validate refresh tokens.
  // It can be extended with additional logic if needed.
}
