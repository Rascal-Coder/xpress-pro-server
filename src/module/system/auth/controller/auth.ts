import {
  Body,
  Controller,
  Inject,
  Post,
  Provide,
  Get,
} from '@midwayjs/decorator';
import { ApiResponse } from '@midwayjs/swagger';
import { RedisService } from '@midwayjs/redis';
import { Context } from '@midwayjs/core';

import { AuthService } from '../service/auth';
import { TokenVO } from '../vo/token';
import { LoginDTO } from '../dto/login';
import { CaptchaService } from '../service/captcha';
import { R } from '@/common/base.error.util';
import { UserService } from '../../user/service/user';
import { NotLogin } from '@/decorator/not.login';
import { UserVO } from '../../user/vo/user';
import { RefreshTokenDTO } from '../dto/refresh.token';
import { RSAService } from '@/common/rsa.service';
import { MailService } from '@/common/mail.service';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@midwayjs/typeorm';
import { uuid } from '@/utils/uuid';
import { ResetPasswordDTO } from '../dto/reset.password';
import { CaptchaVO } from '../vo/captcha';
import { PublicKeyVO } from '../vo/publickey';
@Provide()
@Controller('/auth')
export class AuthController {
  @Inject()
  authService: AuthService;
  @Inject()
  captchaService: CaptchaService;
  @Inject()
  redisService: RedisService;
  @Inject()
  userService: UserService;
  @Inject()
  mailService: MailService;
  @Inject()
  rsaService: RSAService;
  @InjectDataSource()
  defaultDataSource: DataSource;
  @Inject()
  ctx: Context;

  @Post('/login', { description: '登录' })
  @ApiResponse({ type: TokenVO })
  @NotLogin()
  async login(@Body() loginDTO: LoginDTO) {
    const password = await this.rsaService.decrypt(
      loginDTO.publicKey,
      loginDTO.password
    );
    if (!password) {
      throw R.error('登录出现异常，请重新登录', R.BusinessCode.LOGIN_EXCEPTION);
    }

    loginDTO.password = password;

    return await this.authService.login(loginDTO);
  }

  @Post('/refresh/token', { description: '刷新token' })
  @ApiResponse({ type: TokenVO })
  @NotLogin()
  async refreshToken(@Body() data: RefreshTokenDTO) {
    return this.authService.refreshToken(data);
  }

  @Get('/captcha')
  @ApiResponse({ type: CaptchaVO })
  @NotLogin()
  async getImageCaptcha() {
    const { id, imageBase64 } = await this.captchaService.formula({
      height: 40,
      width: 120,
      noise: 1,
      color: true,
    });
    return {
      id,
      imageBase64,
    };
  }

  @Get('/publicKey', { description: '获取公钥' })
  @ApiResponse({ type: PublicKeyVO })
  @NotLogin()
  async getPublicKey() {
    return await this.rsaService.getPublicKey();
  }

  @Get('/current/user', { description: '获取当前用户' })
  @ApiResponse({ type: UserVO })
  async getCurrentUser(): Promise<UserVO> {
    return await this.authService.getUserById(this.ctx.userInfo.userId);
  }

  @Post('/logout', { description: '退出登录' })
  async logout(): Promise<boolean> {
    // 清除token和refreshToken
    const res = await this.redisService
      .multi()
      .del(`accessToken:${this.ctx.accessToken}`)
      .del(`refreshToken:${this.ctx.userInfo.refreshToken}`)
      .exec();

    if (res.some(item => item[0])) {
      throw R.error('退出登录失败', R.BusinessCode.LOGOUT_FAILED);
    }

    return true;
  }
  @NotLogin()
  @Post('/send/reset/password/email', { description: '发送密码重置邮件' })
  async sendResetPasswordEmail(@Body() emailInfo: { email: string }) {
    if (!emailInfo.email) {
      throw R.error('邮箱不能为空', R.BusinessCode.EMAIL_REQUIRED);
    }

    if (!(await this.userService.getByEmail(emailInfo.email))) {
      throw R.error('系统中不存在当前邮箱', R.BusinessCode.EMAIL_NOT_FOUND);
    }

    const emailCaptcha = uuid();

    await this.redisService.set(
      `resetPasswordEmailCaptcha:${emailInfo.email}`,
      emailCaptcha,
      'EX',
      60 * 30
    );

    const resetPasswordUrl = `https://bug-admin.cn/user/reset-password?email=${emailInfo.email}&emailCaptcha=${emailCaptcha}`;

    this.mailService.sendMail({
      to: emailInfo.email,
      html: `<div style="padding: 28px 0; color: #888;">
      <h1 style="color: #888;">
        <span style="color:#5867dd; margin:0 1px;"><a>${emailInfo.email}</a></span>， 你好！
      </h1>
      <p>请先确认本邮件是否是你需要的。</p>
      <p>请点击下面的地址，根据提示进行密码重置：</p>
      <a href="${resetPasswordUrl}" target="_blank" style="text-decoration: none;
      display: inline-block;
      padding: 8px 25px;
      background: #5867dd;
      cursor: pointer;
      color: #fff;
      border-radius: 5px;" rel="noopener">点击跳转到密码重置页面</a>
      <p>如果单击上面按钮没有反应，请复制下面链接到浏览器窗口中，或直接输入链接。</p>
      <p>
        ${resetPasswordUrl}
      </p>
      <p>如您未提交该申请，请不要理会此邮件，对此为您带来的不便深表歉意。</p>
      <p>本次链接30分钟后失效。</p>
      <div style="text-align: right;margin-top: 50px;">
        <span>bug-admin</span>
      </div>
    </div>`,
      subject: 'bug-admin平台密码重置提醒',
    });
  }

  @NotLogin()
  @Post('/reset/password', { description: '重置密码' })
  async resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO) {
    await this.authService.resetPassword(resetPasswordDTO);
  }
}
