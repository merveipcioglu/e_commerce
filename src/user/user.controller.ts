import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('balance') balance?: number,
  ) {
    const user = await this.userService.createUser(firstName, lastName, email, password, balance);
    return user;
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new HttpException('E-mail yada şifreniz hatalı. Tekrar deneyin!', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.login(user);
  }
}
