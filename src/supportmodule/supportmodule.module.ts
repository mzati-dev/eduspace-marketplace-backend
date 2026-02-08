import { Module } from '@nestjs/common';
import { SupportService } from './supportmodule.service';
import { SupportController } from './supportmodule.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';


@Module({
  imports: [
    ConfigModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule { }
