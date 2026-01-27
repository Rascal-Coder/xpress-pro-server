import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { BaseErrorFilter } from './base.filter';

@Catch()
export class DefaultErrorFilter extends BaseErrorFilter {
  async catch(err: Error, ctx: Context) {
    const message = await this.translateMessage(ctx, err.message);
    return this.setErrorResponse(ctx, 500, message);
  }
}
