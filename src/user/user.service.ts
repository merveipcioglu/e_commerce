import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(firstName: string, lastName: string, email: string, password: string, balance?: number): Promise<any> {
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new HttpException('Bu e-posta adresi ile kayıtlı kullanıcı bulunmaktadır.', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.usersRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      balance: balance !== undefined ? balance : 1000,
    });
    const savedUser = await this.usersRepository.save(newUser);

    return {
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      balance: savedUser.balance,
    };
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, id, ...result } = user;
      return result;
    }
    return null;
  }
}
