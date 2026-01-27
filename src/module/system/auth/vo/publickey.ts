import { ApiProperty } from '@midwayjs/swagger';

export class PublicKeyVO {
  @ApiProperty({ description: '公钥' })
  publicKey: string;
}
