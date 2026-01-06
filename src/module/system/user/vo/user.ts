import { ApiProperty } from '@midwayjs/swagger';

export class UserVO {
  @ApiProperty({ description: '用户ID' })
  id: string;

  @ApiProperty({ description: '用户名称' })
  userName: string;

  @ApiProperty({ description: '用户昵称' })
  nickName: string;

  @ApiProperty({ description: '手机号' })
  phoneNumber: string;

  @ApiProperty({ description: '邮箱' })
  email: string;
}
