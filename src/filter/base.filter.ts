import { Context } from '@midwayjs/koa';
import { MidwayI18nService } from '@midwayjs/i18n';

/**
 * 错误过滤器基类
 * 提供通用的 i18n 获取和消息翻译功能
 * 注意：响应格式化由中间件统一处理，Filter 只负责设置状态码和错误消息
 */
export abstract class BaseErrorFilter {
  /**
   * 获取国际化服务
   */
  protected async getI18nService(ctx: Context): Promise<MidwayI18nService> {
    return await ctx.requestContext.getAsync(MidwayI18nService);
  }

  /**
   * 翻译错误消息
   * @param ctx 上下文对象
   * @param messageOrKey 错误消息或翻译键
   * @returns 翻译后的消息，如果翻译失败则返回原始消息
   */
  protected async translateMessage(
    ctx: Context,
    messageOrKey: string
  ): Promise<string> {
    const i18nService = await this.getI18nService(ctx);
    return i18nService.translate(messageOrKey) || messageOrKey;
  }

  /**
   * 设置错误响应并返回格式化的响应对象
   * Filter 直接返回格式化的响应，确保中间件能正确处理
   * @param ctx 上下文对象
   * @param status HTTP 状态码
   * @param message 错误消息
   * @param businessCode 业务错误码（可选），如果提供则使用业务错误码，否则使用 HTTP 状态码
   * @returns 格式化的错误响应对象
   */
  protected setErrorResponse(
    ctx: Context,
    status: number,
    message: string,
    businessCode?: number
  ): { data: null; code: number; message: string } {
    ctx.status = status;
    return {
      data: null,
      code: businessCode ?? status,
      message,
    };
  }
}
