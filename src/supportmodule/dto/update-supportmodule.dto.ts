import { PartialType } from '@nestjs/mapped-types';
import { CreateSupportmoduleDto } from './create-supportmodule.dto';

export class UpdateSupportmoduleDto extends PartialType(CreateSupportmoduleDto) {}
