import { omit } from 'lodash';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../../common/base.entity';
import { UserVO } from '../vo/user';

@Entity('sys_user')
export class UserEntity extends BaseEntity {
  @Column({ comment: '用户名称' })
  userName: string;
  @Column({ comment: '用户昵称' })
  nickName: string;
  @Column({ comment: '手机号' })
  phoneNumber: string;
  @Column({ comment: '邮箱', nullable: true })
  email: string;
  @Column({ comment: '密码' })
  password: string;
  toVO(): UserVO {
    const userVO = omit<UserEntity>(this, ['password']) as UserVO;
    return userVO;
  }
}
