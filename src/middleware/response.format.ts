import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

/**
 * 响应格式化中间件
 * 统一处理所有响应的格式，包括成功响应和错误响应
 */
@Middleware()
export class ResponseFormatMiddleware
  implements IMiddleware<Context, NextFunction>
{
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      await next();

      // 跳过 204 No Content 响应
      if (ctx.status === 204) {
        return;
      }

      // 跳过文件流响应（如文件下载）
      if (
        ctx.response.type &&
        (ctx.response.type.includes('stream') ||
          ctx.response.type.includes('octet-stream') ||
          ctx.response.type.includes('image') ||
          ctx.response.type.includes('video') ||
          ctx.response.type.includes('application/pdf'))
      ) {
        return;
      }

      // 检查响应是否已经是标准格式（Filter 已处理的错误响应或已格式化的响应）
      if (
        ctx.body &&
        typeof ctx.body === 'object' &&
        !Array.isArray(ctx.body) &&
        'code' in ctx.body &&
        'message' in ctx.body
      ) {
        return; // Filter 已处理，跳过
      }

      // 只处理成功响应（错误响应已由 Filter 处理）
      if (ctx.body !== undefined && ctx.body !== null && ctx.status < 400) {
        ctx.body = {
          data: ctx.body,
          code: 0,
          message: 'success',
        };
      }
    };
  }

  static getName(): string {
    return 'responseFormat';
  }
}
