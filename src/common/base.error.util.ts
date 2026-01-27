import { MidwayValidationError } from '@midwayjs/validate';
import { CommonError } from './common.error';
import { httpError } from '@midwayjs/core';
import { BusinessErrorCode } from './business.error.code';

export class R {
  /**
   * 创建业务错误
   * @param message 错误消息
   * @param businessCode 业务错误码（可选），用于区分不同的业务错误场景
   * @returns CommonError 实例
   */
  static error(message: string, businessCode?: number) {
    return new CommonError(message, businessCode);
  }

  /**
   * 业务错误码常量，方便使用
   */
  static readonly BusinessCode = BusinessErrorCode;

  static validateError(message: string) {
    return new MidwayValidationError(message, 422, null);
  }

  static unauthorizedError(message: string) {
    return new httpError.UnauthorizedError(message);
  }

  static forbiddenError(message: string) {
    return new httpError.ForbiddenError(message);
  }
}
