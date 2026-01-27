/**
 * 业务错误码定义
 * 用于区分不同的业务错误场景
 * HTTP 状态码统一使用 400（客户端错误），业务错误码用于具体区分
 */
export enum BusinessErrorCode {
  // 认证相关错误 (1000-1099)
  /** 账号或密码错误 */
  ACCOUNT_OR_PASSWORD_ERROR = 1001,
  // /** 用户名或密码错误 */
  // USERNAME_OR_PASSWORD_ERROR = 1002,
  /** 验证码错误 */
  CAPTCHA_ERROR = 1002,
  /** 用户凭证已过期 */
  TOKEN_EXPIRED = 1003,
  /** 当前用户不存在 */
  USER_NOT_FOUND = 1004,

  // 用户相关错误 (1100-1199)
  /** 当前用户名已存在 */
  USERNAME_EXISTS = 1101,
  /** 当前手机号已存在 */
  PHONE_EXISTS = 1102,
  /** 当前邮箱已存在 */
  EMAIL_EXISTS = 1103,
  /** 邮箱验证码错误或已生效 */
  EMAIL_CAPTCHA_ERROR = 1104,
  /** 邮箱验证码错误或已失效 */
  EMAIL_CAPTCHA_EXPIRED = 1105,
  /** 邮箱不存在 */
  EMAIL_NOT_FOUND = 1106,
  /** 邮箱不能为空 */
  EMAIL_REQUIRED = 1107,
  /** 邮箱验证码不能为空 */
  EMAIL_CAPTCHA_REQUIRED = 1108,

  // 系统相关错误 (1200-1299)
  /** 登录出现异常 */
  LOGIN_EXCEPTION = 1201,
  /** 退出登录失败 */
  LOGOUT_FAILED = 1202,
}
