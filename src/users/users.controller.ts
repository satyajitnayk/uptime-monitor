import { Body, Controller, Get, Post } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // TODO: We can remove this endpoint later on
  @Get()
  async getAllUsers(): Promise<any[]> {
    const existingUsers = await this.userService.users({});
    const data = [];
    existingUsers.map((user) => {
      const { email, userId, createdAt } = user;
      data.push({ email, userId, createdAt });
    });

    return data;
  }

  @Post()
  async createUser(
    @Body() userData: { email: string; password: string },
  ): Promise<any> {
    const { email, password } = userData;

    //TODO: check if user with same email already exists

    const saltOrRounds = 5;
    const hash = await bcrypt.hash(password, saltOrRounds);

    const createdUser = await this.userService.createUser({
      email,
      password: hash,
    });

    const { email: userEmail, userId, createdAt } = createdUser;

    return { email: userEmail, userId, createdAt };
  }
}
