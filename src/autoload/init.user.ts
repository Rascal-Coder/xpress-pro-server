import { Singleton } from '@midwayjs/core';
import { Autoload, Init } from '@midwayjs/decorator';
import * as Minio from 'minio';

import { UserEntity } from '../module/system/user/entity/user';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';

export type MinioClient = Minio.Client;

@Autoload()
@Singleton()
export class InitUserAutoLoad {
  @InjectEntityModel(UserEntity)
  userModel: Repository<UserEntity>;

  @Init()
  async init() {
    const userCount = await this.userModel.count();

    if (userCount === 0) {
      const adminUser = new UserEntity();
      adminUser.nickName = '管理员';
      adminUser.password =
        '$2b$10$IGeaESSRuh7v/slgz2GfQ.TXvx1t9uPOhpfh50mYxkP0FoVs3whGy';
      adminUser.email = 'admin@qq.com';
      adminUser.phoneNumber = '18144444444';
      adminUser.userName = 'admin';

      await this.userModel.save(adminUser);
    }
  }
}
