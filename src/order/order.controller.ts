import { Controller, Post, Get, Body, Request, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createOrder(@Request() req, @Body() createOrderDto: { productName: string; quantity: number; price: number }) {
    const userId = req.user.id;
    const { productName, quantity, price } = createOrderDto;
    return this.orderService.createOrder(userId, productName, quantity, price);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getOrders(@Request() req) {
    const userId = req.user.id;
    return this.orderService.getOrders(userId);
  }
}
