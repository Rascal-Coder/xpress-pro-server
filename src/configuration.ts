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
import { UnauthorizedErrorFilter } from './filter/unauthorized.filter';
import { DefaultErrorFilter } from './filter/default.filter';
import * as dotenv from 'dotenv';
import * as bull from '@midwayjs/bull';
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

  async onReady() {
    // add middleware
    this.app.useMiddleware([AuthMiddleware]);
    // add filter
    this.app.useFilter([
      ValidateErrorFilter,
      CommonErrorFilter,
      NotFoundFilter,
      UnauthorizedErrorFilter,
      DefaultErrorFilter,
    ]);
  }
}
