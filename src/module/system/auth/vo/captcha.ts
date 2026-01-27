import { ApiProperty } from '@midwayjs/swagger';

export class CaptchaVO {
  @ApiProperty({ description: '验证码id' })
  id: string;
  @ApiProperty({ description: '验证码图片' })
  imageBase64: string;
}
