import { Catch } from '@midwayjs/core';
import { MidwayValidationError } from '@midwayjs/validate';
import { Context } from '@midwayjs/koa';
import { BaseErrorFilter } from './base.filter';

@Catch(MidwayValidationError)
export class ValidateErrorFilter extends BaseErrorFilter {
  async catch(err: MidwayValidationError, ctx: Context) {
    const message = await this.translateMessage(ctx, err.message);
    return this.setErrorResponse(ctx, 422, message);
  }
}
