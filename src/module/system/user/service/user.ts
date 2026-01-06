import { Config, Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Not, Repository } from 'typeorm';
import { RedisService } from '@midwayjs/redis';
import { BaseService } from '../../../../common/base.service';
import { AssertUtils } from '../../../../utils/assert';
import { FilterQuery } from '../../../../utils/filter-query';
import { like } from '../../../../utils/typeorm-utils';
import { UserDTO } from '../dto/user';
import { UserPageDTO } from '../dto/user-page';
import { UserEntity } from '../entity/user';
import { UserPageVO } from '../vo/user-page';
import { UserVO } from '../vo/user';

@Provide()
export class UserService extends BaseService<UserEntity> {
  @InjectEntityModel(UserEntity)
  userModel: Repository<UserEntity>;

  @Inject()
  redisService: RedisService;

  @Config('defaultPassword')
  defaultPassword: string;

  getModel(): Repository<UserEntity> {
    return this.userModel;
  }

  /**
   * 分页获取用户列表
   */
  async getUsersByPage(userPageDTO: UserPageDTO): Promise<UserPageVO> {
    const query = new FilterQuery<UserEntity>();

    query
      .append(
        'phoneNumber',
        like(userPageDTO.phoneNumber),
        !!userPageDTO.phoneNumber
      )
      .append('userName', like(userPageDTO.userName), !!userPageDTO.userName)
      .append('nickName', like(userPageDTO.nickName), !!userPageDTO.nickName)
      .append('email', like(userPageDTO.email), !!userPageDTO.email);

    const pageInfo = this.getPageByPageDTO(userPageDTO);

    const [data] = await this.userModel.findAndCount({
      where: query.where,
      skip: pageInfo.skip,
      take: pageInfo.take,
      order: { createDate: 'DESC' },
    });
    return {
      data: data.map(entity => entity.toVO()),
      total: data.length,
    };
  }

  /**
   * 创建用户
   */
  async createUser(userDTO: UserDTO): Promise<UserVO> {
    const { userName, phoneNumber, email } = userDTO;

    // 校验用户名唯一性
    let exists = await this.userModel.countBy({ userName });
    AssertUtils.isTrue(exists === 0, '当前用户名已存在');

    // 校验手机号唯一性
    exists = await this.userModel.countBy({ phoneNumber });
    AssertUtils.isTrue(exists === 0, '当前手机号已存在');

    // 校验邮箱唯一性（如果提供了邮箱）
    if (email) {
      exists = await this.userModel.countBy({ email });
      AssertUtils.isTrue(exists === 0, '当前邮箱已存在');
    }

    const entity = userDTO.toEntity();
    // 对密码进行加盐加密
    const hashPassword = bcrypt.hashSync(this.defaultPassword || '123456', 10);
    entity.password = hashPassword;

    const savedEntity = await this.userModel.save(entity);
    return savedEntity as UserVO;
  }

  /**
   * 更新用户
   */
  async updateUser(userDTO: UserDTO) {
    const { userName, phoneNumber, email, id, nickName } = userDTO;

    AssertUtils.notEmpty(id, '用户ID不能为空');

    // 校验用户是否存在
    const existingUser = await this.userModel.findOneBy({ id });
    AssertUtils.notEmpty(existingUser, '用户不存在');

    // 校验用户名唯一性（排除自身）
    let duplicateUser = await this.userModel.findOneBy({
      userName,
      id: Not(id),
    });
    AssertUtils.isTrue(!duplicateUser, '当前用户名已存在');

    // 校验手机号唯一性（排除自身）
    duplicateUser = await this.userModel.findOneBy({
      phoneNumber,
      id: Not(id),
    });
    AssertUtils.isTrue(!duplicateUser, '当前手机号已存在');

    // 校验邮箱唯一性（如果提供了邮箱，排除自身）
    if (email) {
      duplicateUser = await this.userModel.findOneBy({ email, id: Not(id) });
      AssertUtils.isTrue(!duplicateUser, '当前邮箱已存在');
    }

    // 更新用户信息
    await this.userModel.update(id, {
      userName,
      nickName,
      phoneNumber,
      email,
    });

  }

  /**
   * 删除用户
   */
  async removeUser(id: string): Promise<void> {
    AssertUtils.notEmpty(id, '用户ID不能为空');

    const user = await this.userModel.findOneBy({ id });
    AssertUtils.notEmpty(user, '用户不存在');

    // 清除用户相关的 Redis 缓存
    const tokens = await this.redisService.smembers(`userToken_${id}`);
    const refreshTokens = await this.redisService.smembers(
      `userRefreshToken_${id}`
    );

    await Promise.all([
      // 删除用户
      this.userModel.delete(id),
      // 清除 token
      ...tokens.map(token => this.redisService.del(`token:${token}`)),
      ...refreshTokens.map(refreshToken =>
        this.redisService.del(`refreshToken:${refreshToken}`)
      ),
      // 清除 token 集合
      this.redisService.del(`userToken_${id}`),
      this.redisService.del(`userRefreshToken_${id}`),
    ]);
  }

}
