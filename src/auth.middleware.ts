import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authToken = req.headers?.authorization ?? '';

    const decodedJwtAuthToken = this.jwtService.decode(authToken);
    if (decodedJwtAuthToken == null) {
      return res.send({
        statusCode: 403,
        error: 'not authorized',
      });
    }
    const { userId, email } = JSON.parse(JSON.stringify(decodedJwtAuthToken));

    req.user = { userId, email };

    next();
  }
}
