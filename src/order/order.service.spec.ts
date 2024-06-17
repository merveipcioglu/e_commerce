import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';

const mockOrderRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: MockRepository<Order>;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useFactory: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<MockRepository<Order>>(getRepositoryToken(Order));
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order and update user balance', async () => {
      const userId = 1;
      const productName = 'Product A';
      const quantity = 2;
      const price = 50;
      const totalPrice = quantity * price;

      const user = { id: userId, balance: 200, save: jest.fn() } as any;

      userRepository.findOne.mockResolvedValue(user);
      user.balance -= totalPrice;
      userRepository.save.mockResolvedValue(user);

      const order = { productName, quantity, price, userId };
      orderRepository.create.mockReturnValue(order);
      orderRepository.save.mockResolvedValue({ ...order, id: 1 });

      const result = await service.createOrder(userId, productName, quantity, price);

      expect(result).toEqual({
        productName,
        quantity,
        price,
        userId,
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(orderRepository.create).toHaveBeenCalledWith(order);
      expect(orderRepository.save).toHaveBeenCalledWith(order);
    });

    it('should throw an error if user is not found', async () => {
      const userId = 1;
      const productName = 'Product A';
      const quantity = 2;
      const price = 50;

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.createOrder(userId, productName, quantity, price)).rejects.toThrow(HttpException);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(orderRepository.create).not.toHaveBeenCalled();
      expect(orderRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if user has insufficient balance', async () => {
      const userId = 1;
      const productName = 'Product A';
      const quantity = 2;
      const price = 150;
      const totalPrice = quantity * price;

      const user = { id: userId, balance: 100 } as any;

      userRepository.findOne.mockResolvedValue(user);

      await expect(service.createOrder(userId, productName, quantity, price)).rejects.toThrow(HttpException);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(orderRepository.create).not.toHaveBeenCalled();
      expect(orderRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getOrders', () => {
    it('should return orders for a user', async () => {
      const userId = 1;
      const orders = [
        { productName: 'Product A', quantity: 2, price: 50, userId },
        { productName: 'Product B', quantity: 1, price: 100, userId },
      ];

      orderRepository.find.mockResolvedValue(orders);

      const result = await service.getOrders(userId);

      expect(result).toEqual(orders);
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { userId },
        select: ['productName', 'quantity', 'price', 'userId'],
      });
    });
  });
});
