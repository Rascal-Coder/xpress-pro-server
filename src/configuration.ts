import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import * as orm from '@midwayjs/typeorm';
import * as redis from '@midwayjs/redis';
import * as swagger from '@midwayjs/swagger';
import * as upload from '@midwayjs/upload';
import { ValidateErrorFilter } from './filter/validate.filter';
import { CommonErrorFilter } from './filter/common.filter';
import { NotFoundFilter } from './filter/notfound.filter';
import * as i18n from '@midwayjs/i18n';
import * as cache from '@midwayjs/cache';
import { AuthMiddleware } from './middleware/auth';
import { ResponseFormatMiddleware } from './middleware/response.format';
import { UnauthorizedErrorFilter } from './filter/unauthorized.filter';
import { DefaultErrorFilter } from './filter/default.filter';
import * as dotenv from 'dotenv';
import * as bull from '@midwayjs/bull';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { UserEntity } from './module/system/user/entity/user';
import { Repository } from 'typeorm';
// 加载环境变量
const env = process.env.NODE_ENV || 'local';

const envFile = `.env.${env}`;
dotenv.config({ path: join(__dirname, '..', envFile) });
@Configuration({
  imports: [
    koa,
    validate,
    orm,
    redis,
    i18n,
    cache,
    {
      component: swagger,
      enabledEnvironment: ['local'],
    },
    // crossDomain,
    upload,
    bull,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;
  @InjectEntityModel(UserEntity)
  userModel: Repository<UserEntity>;

  async onReady() {
    // add middleware
    this.app.useMiddleware([AuthMiddleware, ResponseFormatMiddleware]);
    // add filter
    this.app.useFilter([
      ValidateErrorFilter,
      CommonErrorFilter,
      NotFoundFilter,
      UnauthorizedErrorFilter,
      DefaultErrorFilter,
    ]);

    console.log(this.userModel, 'this.userModel');

    const userCount = await this.userModel.count();

    if (userCount === 0) {
      console.log('检测到管理员账号不存在，正在为你创建。');
      const adminUser = new UserEntity();
      adminUser.nickName = '管理员';
      adminUser.password =
        '$2b$10$IGeaESSRuh7v/slgz2GfQ.TXvx1t9uPOhpfh50mYxkP0FoVs3whGy';
      adminUser.email = 'admin@qq.com';
      adminUser.phoneNumber = '18144444444';
      adminUser.userName = 'admin';

      await this.userModel.save(adminUser);
    }
  }
}
