import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user';
import { RedisService } from '@midwayjs/redis';
import { MidwayI18nService } from '@midwayjs/i18n';
// import { UserDTO } from '../dto/user';
import { ILogger } from '@midwayjs/logger';
import { R } from '../common/base.error.util';
import { UserDTO } from '../dto/user';
// import { CommonError } from '../common/common.error';
@Controller('/')
export class HomeController {
  @Inject()
  logger: ILogger;
  // 自动注入模型
  @InjectEntityModel(User)
  userModel: Repository<User>;
  @Inject()
  redisService: RedisService;
  // 自动注入i18n服务
  @Inject()
  i18nService: MidwayI18nService;
  @Post('/')
  async home(): Promise<void> {
    // throw new CommonError('error');
    throw R.error('error');
  }
  // @Post('/')
  // async home(): Promise<void> {
  //   throw new CommonError('error');
  // }
  @Post('/userInfo')
  async userInfo(@Body() user: UserDTO): Promise<void> {
    console.log(user);
  }
  // @Get('/')
  // async home(): Promise<User[]> {
  //   await this.redisService.set('test', 'test');
  //   const test = await this.redisService.get('test');
  //   console.log('test===========>', test);
  //   // return await this.userModel.find();
  //   return this.i18nService.translate('hello', {
  //     locale: 'zh_CN',
  //   });
  // }
}
