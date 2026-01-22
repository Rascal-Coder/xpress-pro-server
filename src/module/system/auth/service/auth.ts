import { Config, Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
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
      .set(`userRefreshToken:${user.id}`, refreshToken)
      .expire(`userRefreshToken:${accessToken}`, refreshExpire)
      .exec();

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
        'file.id = u.avatar'
      )
      .where('u.id = :id', { id: userId })
      .getOne();
    if (!entity) {
      throw R.error('当前用户不存在！');
    }

    return entity.toVO();
  }
}
