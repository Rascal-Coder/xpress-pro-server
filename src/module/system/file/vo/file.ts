import { FileEntity } from '../entity/file';
import { PickVO } from '@/utils/vo.utils';

export class FileVO extends PickVO(FileEntity, []) {}
