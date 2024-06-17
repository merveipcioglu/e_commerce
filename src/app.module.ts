import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { ServiceModule } from './service/service.module';
import { User } from './user/user.entity';
import { Order } from './order/order.entity';
import { Service } from './service/service.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Order, Service],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    OrderModule,
    ServiceModule,
  ],
})
export class AppModule {}
