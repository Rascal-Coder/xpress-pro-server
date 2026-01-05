import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
@Entity('user')
export class User extends BaseEntity {
  @Column({ comment: '姓名' })
  name: string;
  @Column({ comment: '年龄' })
  age: number;
}
