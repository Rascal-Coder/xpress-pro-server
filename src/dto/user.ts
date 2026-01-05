import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';
import { R } from '../common/base.error.util';

export class UserDTO {
  @ApiProperty({
    description: '用户ID',
    example: 1,
  })
  id?: number;

  @ApiProperty({
    description: '用户年龄',
    example: 18,
  })
  @Rule(RuleType.number().required().error(R.validateError('年龄不能为空')))
  age: number;
}
