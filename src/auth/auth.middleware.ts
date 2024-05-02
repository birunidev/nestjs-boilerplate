import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMidleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}
  async use(req: Request, _: any, next: NextFunction) {
    if (!req.headers.authorization) return next();
    const token = req?.headers?.authorization?.split?.(' ')[1] ?? null;
    if (!token) return next();
    const user = await this.authService.parseUserByToken(token);

    req.user = user;

    next();
  }
}
