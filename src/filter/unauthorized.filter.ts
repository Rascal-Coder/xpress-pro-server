import { Catch, httpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UnauthorizedError } from '@midwayjs/core/dist/error/http';
import { BaseErrorFilter } from './base.filter';

@Catch(httpError.UnauthorizedError)
export class UnauthorizedErrorFilter extends BaseErrorFilter {
  async catch(err: UnauthorizedError, ctx: Context) {
    const message = await this.translateMessage(ctx, err.message);
    return this.setErrorResponse(ctx, 401, message);
  }
}
