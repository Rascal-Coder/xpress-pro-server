import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { CommonError } from '@/common/common.error';
import { BaseErrorFilter } from './base.filter';

@Catch(CommonError)
export class CommonErrorFilter extends BaseErrorFilter {
  async catch(err: CommonError, ctx: Context) {
    const message = await this.translateMessage(ctx, err.message);
    return this.setErrorResponse(ctx, 400, message, err.businessCode);
  }
}
