import { Catch, httpError, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { MidwayI18nService } from '@midwayjs/i18n';

@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    const i18nService = await ctx.requestContext.getAsync(MidwayI18nService);
    const message = i18nService.translate('not.found');
    ctx.status = 404;
    return {
      code: 404,
      message,
    };
  }
}

