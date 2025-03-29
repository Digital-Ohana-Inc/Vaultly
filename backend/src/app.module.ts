import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule, ShopModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
