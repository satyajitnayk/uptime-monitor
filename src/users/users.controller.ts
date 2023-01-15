import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // TODO: We can remove this endpoint later on
  @Get()
  async getAllUsers(): Promise<any> {
    const existingUsers = await this.userService.users({});
    const data = [];
    existingUsers.map((user) => {
      const { email, userId, createdAt } = user;
      data.push({ email, userId, createdAt });
    });

    return {
      statusCode: 200,
      data,
      message: 'fetched all users',
    };
  }

  @Post('/signup')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<any> {
    try {
      const { email, password } = createUserDto;

      const exisitngUser = await this.userService.user({ email });
      if (exisitngUser) {
        return {
          statusCode: 400,
          message: 'user with given email already exists',
        };
      }

      const saltOrRounds = 5;
      const hash = await bcrypt.hash(password, saltOrRounds);

      const createdUser = await this.userService.createUser({
        email,
        password: hash,
      });

      const { email: userEmail, userId, createdAt } = createdUser;

      return {
        statusCode: 200,
        data: { email: userEmail, userId, createdAt },
        message: 'user signed up successfully',
      };
    } catch (error) {
      console.log(error.message);
      return {
        statusCode: 500,
        error: 'something went wrong',
      };
    }
  }

  @Post('/login')
  async loginUser(@Body() loginUserDto: LoginUserDto): Promise<any> {
    //TODO: validate user input
    // validate email & user eneterd password & check with exisitng hashed password
    const { email, password } = loginUserDto;
    const user = await this.userService.user({ email });
    // TODO: return no user found
    if (!user) {
      return {
        statusCode: 404,
        error: 'user not found',
      };
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // create jwt contaning userId & email as payload
      const payload = { email: user.email, userId: user.userId };
      return {
        statusCode: 200,
        data: {
          accessToken: this.jwtService.sign(payload, {
            expiresIn: '30m',
            secret: process.env.JWT_KEY,
          }),
        },
        message: 'login successful',
      };
    } else {
      // TODO: action for no password match
      return {
        statusCode: 400,
        error: 'unable to authenticate user',
      };
    }
  }
}
