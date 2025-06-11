import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
import { TokenPayload } from './tokenPayload.interface';

@Injectable()
export class JwtTwoFactorAuthenticationStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        },
      ]),
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.getById(payload.userId);
    if (!user.isTwoFactorAuthenticationEnabled) {
      return user;
    }
    if (payload.isSecondFactorAuthenticated) {
      return user;
    }
  }
}
