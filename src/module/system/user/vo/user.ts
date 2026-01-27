import { ApiProperty } from '@midwayjs/swagger';
import { FileVO } from '../../file/vo/file';

export class UserVO {
  @ApiProperty({ description: '主键ID', required: false })
  id?: string;

  @ApiProperty({ description: '用户名称' })
  userName: string;

  @ApiProperty({ description: '用户昵称' })
  nickName: string;

  @ApiProperty({ description: '手机号' })
  phoneNumber: string;

  @ApiProperty({ description: '邮箱' })
  email: string;

  @ApiProperty({ description: '性别（0:女，1:男）', required: false })
  sex?: number;

  @ApiProperty({
    description: '头像文件信息',
    type: () => FileVO,
    required: false,
  })
  avatarEntity?: FileVO;
  @ApiProperty({ description: '创建时间', required: false })
  createDate?: Date;

  @ApiProperty({ description: '更新时间', required: false })
  updateDate?: Date;
}
