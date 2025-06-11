import {
  Body,
  ClassSerializerInterceptor,
  Controller, HttpCode,
  Post,
  Req,
  Res, UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { JwtAuthenticationGuard } from '../jwt-authentication.guard';
import { Response } from 'express';
import { RequestWithUser } from '../requestWithUser.interface';
import { TwoFactorAuthenticationCodeDto } from './dto/twoFactorAuthentication.dto';
import { UsersService } from '../../users/users.service';
import { AuthenticationService } from '../authentication.service';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly userService: UsersService,
    private readonly authenticationService: AuthenticationService
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthenticationGuard)
  async register(@Res() response: Response, @Req() request: RequestWithUser) {
    const { otpauthUrl } =
      await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
        request.user,
      );

    return this.twoFactorAuthenticationService.pipeQrCodeStream(
      response,
      otpauthUrl,
    );
  }

  @Post('turn-on')
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  async turnOnTwoFactorAuthentication(
    @Req() request: RequestWithUser,
    @Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationCodeDto
  ) {
    const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode, request.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.userService.turnOnTwoFactorAuthentication(request.user.id);
  }

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  async authenticate(
    @Req() request: RequestWithUser,
    @Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationCodeDto
  ) {
    const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode, request.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id, true);

    request.res.setHeader('Set-Cookie', [accessTokenCookie]);

    return request.user;
  }
}
