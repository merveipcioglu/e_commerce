import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { User } from '../user/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createOrder(userId: number, productName: string, quantity: number, price: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const totalPrice = quantity * price;

    if (!user) {
      throw new HttpException('Kullanıcı bulunamadı.', HttpStatus.NOT_FOUND);
    }

    if (user.balance < totalPrice) {
      throw new HttpException('Yetersiz Bakiye.', HttpStatus.BAD_REQUEST);
    }

    user.balance -= totalPrice;
    await this.userRepository.save(user);

    const order = this.orderRepository.create({ productName, quantity, price, userId });
    const savedOrder = await this.orderRepository.save(order);
    

    return {
      productName: savedOrder.productName,
      quantity: savedOrder.quantity,
      price: savedOrder.price,
      userId: savedOrder.userId
    };
  }

  async getOrders(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      select: ['productName', 'quantity', 'price', 'userId'],
    });
  }
}
