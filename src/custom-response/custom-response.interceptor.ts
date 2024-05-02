// custom-response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomResponseDto } from './custom-response.dto';

@Injectable()
export class CustomResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        if (data instanceof CustomResponseDto) {
          response.status(data.statusCode).json({
            statusCode: data.statusCode,
            message: data.message,
            data: data.data,
          });
        } else {
          return data;
        }
      }),
    );
  }
}
