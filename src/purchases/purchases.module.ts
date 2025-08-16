import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { Purchase } from './entities/purchase.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
// import { Purchase } from './purchase.entity';
// import { Lesson } from '../lessons/lesson.entity';
// import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, Lesson, User]),
    AuthModule,
    UsersModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule { }