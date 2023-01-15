import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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

  @Post('/signup')
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

  @Post('/login')
  async loginUser(
    @Body() userData: { email: string; password: string },
  ): Promise<any> {
    //TODO: validate user input
    // validate email & user eneterd password & check with exisitng hashed password
    const { email, password } = userData;
    const user = await this.userService.user({ email });
    // TODO: return no user found
    if (!user) {
      return {
        error: 'user not found',
      };
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // create jwt contaning userId & email as payload
      const payload = { email: user.email, userId: user.userId };
      return {
        accessToken: this.jwtService.sign(payload, {
          expiresIn: '30m',
          secret: process.env.JWT_KEY,
        }),
      };
    } else {
      // TODO: action for no password match
      return {
        error: 'unable to authenticate user',
      };
    }
  }
}
