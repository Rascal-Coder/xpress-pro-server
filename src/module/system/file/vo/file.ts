import { ApiProperty } from '@midwayjs/swagger';

export class FileVO {
  @ApiProperty({ description: '主键ID', required: false })
  id?: string;

  @ApiProperty({ description: '文件名', required: false })
  fileName?: string;

  @ApiProperty({ description: '文件路径', required: false })
  filePath?: string;

  @ApiProperty({ description: '外键名称', required: false })
  pkName?: string;

  @ApiProperty({ description: '外键值', required: false })
  pkValue?: string;

  @ApiProperty({ description: '创建时间', required: false })
  createDate?: Date;

  @ApiProperty({ description: '更新时间', required: false })
  updateDate?: Date;
}
