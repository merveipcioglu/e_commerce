import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Order } from './order.entity';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

const mockOrderService = () => ({
  createOrder: jest.fn(),
  getOrders: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const mockOrderRepository = () => ({
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: ReturnType<typeof mockOrderService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useFactory: mockOrderService,
        },
        {
          provide: getRepositoryToken(Order),
          useFactory: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
        AuthService,
        UserService,
        {
          provide: JwtService,
          useFactory: mockJwtService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order and return it', async () => {
      const userId = 1;
      const createOrderDto = { productName: 'Product A', quantity: 2, price: 50 };

      const order = {
        productName: 'Product A',
        quantity: 2,
        price: 50,
        userId: 1,
      };

      orderService.createOrder.mockResolvedValue(order);

      const req = { user: { id: userId } };

      const result = await controller.createOrder(req, createOrderDto);

      expect(result).toEqual(order);
      expect(orderService.createOrder).toHaveBeenCalledWith(userId, createOrderDto.productName, createOrderDto.quantity, createOrderDto.price);
    });
  });

  describe('getOrders', () => {
    it('should return orders for a user', async () => {
      const userId = 1;
      const orders = [
        { productName: 'Product A', quantity: 2, price: 50, userId },
        { productName: 'Product B', quantity: 1, price: 100, userId },
      ];

      orderService.getOrders.mockResolvedValue(orders);

      const req = { user: { id: userId } };

      const result = await controller.getOrders(req);

      expect(result).toEqual(orders);
      expect(orderService.getOrders).toHaveBeenCalledWith(userId);
    });
  });
});
