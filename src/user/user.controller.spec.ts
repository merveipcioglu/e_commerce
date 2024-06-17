import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

const mockUserRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let authService: AuthService;
  let userRepository: MockRepository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        AuthService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
        {
          provide: JwtService,
          useFactory: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should create a user and return the user without password', async () => {
      const createUserDto = {
        firstName: 'test',
        lastName: 'test',
        email: 'test@gmial.com',
        password: 'test',
      };

      const savedUser = {
        id: 1,
        firstName: 'test',
        lastName: 'test',
        email: 'test@gmail.com',
        balance: 1000,
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(savedUser);

      const result = await controller.register(
        createUserDto.firstName,
        createUserDto.lastName,
        createUserDto.email,
        createUserDto.password,
      );

      expect(result).toEqual(savedUser);
    });
  });

  describe('login', () => {
    it('should return an access token if credentials are valid', async () => {
      const loginUserDto = {
        email: 'test@gmail.com',
        password: 'test',
      };

      const token = 'some.jwt.token';
      const validatedUser = {
        id: 1,
        firstName: 'test',
        lastName: 'test',
        email: 'test@gmail.com',
        balance: 1000,
      };

      jest.spyOn(userService, 'validateUser').mockResolvedValue(validatedUser);
      jest.spyOn(authService, 'login').mockResolvedValue({ access_token: token });

      const result = await controller.login(loginUserDto.email, loginUserDto.password);

      expect(result).toEqual({ access_token: token });
    });
  });
});
