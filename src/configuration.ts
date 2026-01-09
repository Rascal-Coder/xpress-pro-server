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
import { ReportMiddleware } from './middleware/report.middleware';
import * as i18n from '@midwayjs/i18n';

@Configuration({
  imports: [
    koa,
    validate,
    orm,
    redis,
    i18n,
    {
      component: swagger,
      enabledEnvironment: ['local'],
    },
    // crossDomain,
    upload,
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
    this.app.useMiddleware([ReportMiddleware]);
    // add filter
    this.app.useFilter([
      ValidateErrorFilter,
      CommonErrorFilter,
      NotFoundFilter,
    ]);
  }
}
