import {
  Controller,
  Inject,
  Post,
  Provide,
  Files,
  Get,
  Param,
  Context,
} from '@midwayjs/core';
import { FileService } from '../service/file';
import { NotLogin } from '@/decorator/not.login';
import { ApiBody } from '@midwayjs/swagger';

@Provide()
@Controller('/file')
export class FileController {
  @Inject()
  fileService: FileService;
  @Inject()
  minioClient;
  @Inject()
  ctx: Context;

  @Post('/upload')
  @ApiBody({ description: 'file' })
  @NotLogin()
  async upload(@Files() files) {
    if (files.length) {
      return await this.fileService.upload(files[0]);
    }
    return {};
  }

  // @Get('/info/:id')
  // @NotLogin()
  // async getFileInfo(@Param('id') id: string) {
  //   return await this.fileService.getById(id);
  // }

  @Get('/:bucket/:fileName')
  @NotLogin()
  async getFile(
    @Param('bucket') bucket: string,
    @Param('fileName') fileName: string
  ) {
    const stream = await this.minioClient.getObject(bucket, fileName);
    return stream;
  }
}
