import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthenticationGuard } from './local-authentication.guard';
import { RequestWithUser } from './requestWithUser.interface';
import { Response } from 'express';
import { JwtAuthenticationGuard } from './jwt-authentication.guard';
import { UsersService } from '../users/users.service';
import { JwtRefreshGuard } from './jwt-refresh.guard';

@Controller('authentication')
@SerializeOptions({
  strategy: 'exposeAll',
})
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService,
              private readonly userService: UsersService) {}

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser) {
    const { user } = request;
    const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(user.id);
    const {
      cookie: refreshTokenCookie,
      token: refreshToken
    } = this.authenticationService.getCookieWithJwtRefreshToken(user.id);

    await this.userService.setCurrentRefreshToken(refreshToken, user.id);

    request.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    if (user.isTwoFactorAuthenticationEnabled) {
      return;
    }

    return user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  @HttpCode(200)
  async logOut(@Req() request: RequestWithUser) {
    await this.userService.removeRefreshToken(request.user.id);
    request.res.setHeader('Set-Cookie', this.authenticationService.getCookiesForLogOut());
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser) {
    const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id);

    request.res.setHeader('Set-Cookie', accessTokenCookie);
    return request.user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    user.password = undefined;
    return user;
  }
}
