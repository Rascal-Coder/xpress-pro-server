import { Catch, httpError, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { BaseErrorFilter } from './base.filter';

@Catch(httpError.NotFoundError)
export class NotFoundFilter extends BaseErrorFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    const message = await this.translateMessage(ctx, 'not.found');
    return this.setErrorResponse(ctx, 404, message);
  }
}
