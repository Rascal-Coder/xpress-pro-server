import { MidwayError } from '@midwayjs/core';

/**
 * 通用业务错误类
 * 支持业务错误码，用于区分不同的业务错误场景
 */
export class CommonError extends MidwayError {
  /**
   * 业务错误码，用于区分不同的业务错误
   * 如果未指定，将使用默认值或 HTTP 状态码
   */
  public readonly businessCode?: number;

  constructor(message: string, businessCode?: number) {
    super(message);
    this.businessCode = businessCode;
  }
}
