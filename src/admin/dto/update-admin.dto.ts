import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminUserDto } from './create-admin.dto';

export class UpdateAdminDto extends PartialType(CreateAdminUserDto) { }
