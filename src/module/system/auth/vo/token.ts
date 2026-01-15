import { ApiProperty } from '@midwayjs/swagger';

export class TokenVO {
  @ApiProperty({ description: 'accessToken的过期时间' })
  expire: number;
  @ApiProperty({ description: 'accessToken' })
  accessToken: string;
  @ApiProperty({ description: 'refreshToken的过期时间' })
  refreshExpire: number;
  @ApiProperty({ description: 'refreshToken' })
  refreshToken: string;
}
