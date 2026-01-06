import {
  Body,
  Controller,
  Del,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@midwayjs/decorator';
import { ApiOkResponse } from '@midwayjs/swagger';
import { RuleType, Valid } from '@midwayjs/validate';
import { R } from '../../../../common/base-error-util';
import { UserDTO } from '../dto/user';
import { UserPageDTO } from '../dto/user-page';
import { UserService } from '../service/user';
import { UserPageVO } from '../vo/user-page';

@Controller('/user', { description: '用户管理' })
export class UserController {
  @Inject()
  userService: UserService;

  @Get('/page', { description: '分页查询' })
  @ApiOkResponse({ type: UserPageVO })
  async page(@Query() userPageDTO: UserPageDTO): Promise<UserPageVO> {
    return await this.userService.getUsersByPage(userPageDTO);
  }

  @Post('/', { description: '创建用户' })
  async create(@Body() data: UserDTO) {
    return await this.userService.createUser(data);
  }

  @Put('/', { description: '更新用户' })
  async update(@Body() data: UserDTO) {
    await this.userService.updateUser(data);
  }

  @Del('/:id', { description: '删除用户' })
  async remove(
    @Valid(RuleType.string().required().error(R.error('id不能为空')))
    @Param('id')
    id: string
  ) {
    await this.userService.removeUser(id);
  }

  @Get('/:id', { description: '根据id查询' })
  async getById(@Param('id') id: string) {
    return await this.userService.getById(id);
  }
}
