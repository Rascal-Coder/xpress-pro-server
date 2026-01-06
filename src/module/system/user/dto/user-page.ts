import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';
import { PageDTO } from '../../../../common/page.dto';

export class UserPageDTO extends PageDTO {
  @ApiProperty({ description: '用户名称' })
  @Rule(RuleType.string().allow('', null))
  userName: string;

  @ApiProperty({ description: '用户昵称' })
  @Rule(RuleType.string().allow('', null))
  nickName: string;

  @ApiProperty({ description: '手机号' })
  @Rule(RuleType.string().allow('', null))
  phoneNumber: string;

  @ApiProperty({ description: '邮箱' })
  @Rule(RuleType.string().allow('', null))
  email: string;
}
