import { Config, Inject, Provide } from '@midwayjs/decorator';
import { InjectDataSource, InjectEntityModel } from '@midwayjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { UserEntity } from '../../user/entity/user';
import { R } from '@/common/base.error.util';
import { LoginDTO } from '../dto/login';
import { TokenVO } from '../vo/token';
import { TokenConfig } from '@/interface/token.config';
import { RedisService } from '@midwayjs/redis';
import { uuid } from '@/utils/uuid';
import { RefreshTokenDTO } from '../dto/refresh.token';
import { Context } from '@midwayjs/core';
import { FileEntity } from '../../file/entity/file';
import { ResetPasswordDTO } from '../dto/reset.password';
import { RSAService } from '@/common/rsa.service';
import { CaptchaService } from './captcha';
@Provide()
export class AuthService {
  @InjectEntityModel(UserEntity)
  userModel: Repository<UserEntity>;
  @Config('token')
  tokenConfig: TokenConfig;
  @Inject()
  redisService: RedisService;
  @Inject()
  ctx: Context;
  @Inject()
  rsaService: RSAService;
  @InjectDataSource()
  defaultDataSource: DataSource;
  @Inject()
  captchaService: CaptchaService;
  async login(loginDTO: LoginDTO): Promise<TokenVO> {
    const { accountNumber } = loginDTO;
    const user = await this.userModel
      .createQueryBuilder('user')
      .where('user.phoneNumber = :accountNumber', {
        accountNumber,
      })
      .orWhere('user.username = :accountNumber', { accountNumber })
      .orWhere('user.email = :accountNumber', { accountNumber })
      .select(['user.password', 'user.id'])
      .getOne();

    if (!user) {
      throw R.error('账号或密码错误！');
    }

    if (!bcrypt.compareSync(loginDTO.password, user.password)) {
      throw R.error('用户名或密码错误！');
    }

    const { expire, refreshExpire } = this.tokenConfig;

    const accessToken = uuid();
    const refreshToken = uuid();

    // multi可以实现redis指令并发执行
    await this.redisService
      .multi()
      .set(
        `accessToken:${accessToken}`,
        JSON.stringify({ userId: user.id, refreshToken })
      )
      .expire(`accessToken:${accessToken}`, expire)
      .set(`refreshToken:${refreshToken}`, user.id)
      .expire(`refreshToken:${refreshToken}`, refreshExpire)
      .set(`userToken:${user.id}`, accessToken)
      .expire(`userToken:${accessToken}`, expire)
      // .set(`userRefreshToken:${user.id}`, refreshToken)
      // .expire(`userRefreshToken:${accessToken}`, refreshExpire)
      .sadd(`userToken_${user.id}`, accessToken)
      .sadd(`userRefreshToken_${user.id}`, refreshToken)
      .exec();

    const { captcha, captchaId } = loginDTO;

    const result = await this.captchaService.check(captchaId, captcha);

    if (!result) {
      throw R.error('验证码错误');
    }
    return {
      expire,
      accessToken,
      refreshExpire,
      refreshToken,
    } as TokenVO;
  }

  async refreshToken(refreshToken: RefreshTokenDTO): Promise<TokenVO> {
    const userId = await this.redisService.get(
      `refreshToken:${refreshToken.refreshToken}`
    );

    if (!userId) {
      throw R.error('用户凭证已过期，请重新登录！');
    }

    const { expire } = this.tokenConfig;

    const accessToken = uuid();

    await this.redisService
      .multi()
      .set(
        `accessToken:${accessToken}`,
        JSON.stringify({ userId, refreshToken })
      )
      .expire(`accessToken:${accessToken}`, expire)
      .exec();

    const refreshExpire = await this.redisService.ttl(
      `refreshToken:${refreshToken.refreshToken}`
    );

    return {
      expire,
      accessToken,
      refreshExpire,
      refreshToken: refreshToken.refreshToken,
    } as TokenVO;
  }
  async getUserById(userId: number) {
    const entity = await this.userModel
      .createQueryBuilder('u')
      .leftJoinAndMapOne(
        'u.avatarEntity',
        FileEntity,
        'file',
        'file.pkValue = u.id and file.pkName = "user_avatar"'
      )
      .where('u.id = :id', { id: userId })
      .getOne();
    if (!entity) {
      throw R.error('当前用户不存在！');
    }

    return entity.toVO();
  }
  async resetPassword(resetPasswordDTO: ResetPasswordDTO) {
    const captcha = await this.redisService.get(
      `resetPasswordEmailCaptcha:${resetPasswordDTO.email}`
    );

    if (captcha !== resetPasswordDTO.emailCaptcha) {
      throw R.error('邮箱验证码错误或已失效');
    }

    const user = await this.userModel.findOneBy({
      email: resetPasswordDTO.email,
    });

    if (!user) {
      throw R.error('邮箱不存在');
    }

    const password = await this.rsaService.decrypt(
      resetPasswordDTO.publicKey,
      resetPasswordDTO.password
    );

    const tokens = await this.redisService.smembers(`userToken_${user.id}`);
    const refreshTokens = await this.redisService.smembers(
      `userRefreshToken_${user.id}`
    );

    await this.defaultDataSource.transaction(async manager => {
      const hashPassword = bcrypt.hashSync(password, 10);
      user.password = hashPassword;
      await manager.save(UserEntity, user);

      await Promise.all([
        ...tokens.map(token => this.redisService.del(`token:${token}`)),
        ...refreshTokens.map(refreshToken =>
          this.redisService.del(`refreshToken:${refreshToken}`)
        ),
        this.redisService.del(
          `resetPasswordEmailCaptcha:${resetPasswordDTO.email}`
        ),
      ]);
    });
  }
}
