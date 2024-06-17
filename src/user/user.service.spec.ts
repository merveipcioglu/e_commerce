import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { HttpException, HttpStatus } from '@nestjs/common';

const mockUserRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));

    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashedPassword');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should hash password and save user with default balance', async () => {
      const createUserDto = {
        firstName: 'test',
        lastName: 'test',
        email: 'test@gmail.com',
        password: 'test',
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({
        ...createUserDto,
        password: 'hashedPassword',
        balance: 1000,
      });
      userRepository.save.mockResolvedValue({
        ...createUserDto,
        password: 'hashedPassword',
        balance: 1000,
        id: 1,
      });

      const result = await service.createUser(createUserDto.firstName, createUserDto.lastName, createUserDto.email, createUserDto.password);

      expect(result).toEqual({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        balance: 1000,
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
      expect(userRepository.create).toHaveBeenCalledWith({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: 'hashedPassword',
        balance: 1000,
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: 'hashedPassword',
        balance: 1000,
      });
    });

    it('should hash password and save user with provided balance', async () => {
      const createUserDto = {
        firstName: 'test',
        lastName: 'test',
        email: 'test@gmail.com',
        password: 'test',
        balance: 2500,
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({
        ...createUserDto,
        password: 'hashedPassword',
      });
      userRepository.save.mockResolvedValue({
        ...createUserDto,
        password: 'hashedPassword',
        id: 1,
      });

      const result = await service.createUser(createUserDto.firstName, createUserDto.lastName, createUserDto.email, createUserDto.password, createUserDto.balance);

      expect(result).toEqual({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        balance: createUserDto.balance,
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
      expect(userRepository.create).toHaveBeenCalledWith({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: 'hashedPassword',
        balance: createUserDto.balance,
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: 'hashedPassword',
        balance: createUserDto.balance,
      });
    });

    it('should throw an error if email already exists', async () => {
      const createUserDto = {
        firstName: 'test',
        lastName: 'test',
        email: 'test@gmail.com',
        password: 'test',
      };

      userRepository.findOne.mockResolvedValue(createUserDto);

      await expect(service.createUser(createUserDto.firstName, createUserDto.lastName, createUserDto.email, createUserDto.password)).rejects.toThrow(
        new HttpException('Bu e-posta adresi ile kayıtlı kullanıcı bulunmaktadır.', HttpStatus.BAD_REQUEST),
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user data without password if validation succeeds', async () => {
      const email = 'test@gmail.com';
      const password = 'test';
      const user = {
        id: 1,
        firstName: 'test',
        lastName: 'test',
        email,
        password: 'hashedPassword',
        balance: 1000,
      };

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        balance: user.balance,
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });

    it('should return null if validation fails', async () => {
      const email = 'test@gmail.com';
      const password = 'test';

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      userRepository.findOne.mockResolvedValue({
        id: 1,
        firstName: 'test',
        lastName: 'test',
        email,
        password: 'hashedPassword',
        balance: 1000,
      });

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });
  });
});
