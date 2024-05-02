import { Permission } from './permissions/entities/permission.entity';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CustomResponseInterceptor } from './custom-response/custom-response.interceptor';
import { AuthModule } from './auth/auth.module';
import { JwtAppModule } from './jwt/jwt.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { JwtStrategy } from './auth/jwt.strategy';
import { AuthMidleware } from './auth/auth.middleware';
import { AuthService } from './auth/auth.service';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/entities/role.entity';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.local',
      load: [configuration],
    }),
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: configuration().database.host,
      port: configuration().database.port,
      username: configuration().database.username,
      password: configuration().database.password,
      database: configuration().database.database,
      entities: [User, Role, Permission],
      synchronize: true,
    }),
    AuthModule,
    JwtAppModule,
    RolesModule,
    PermissionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CustomResponseInterceptor,
    },
    AuthService,
  ],
  exports: [JwtAppModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMidleware).forRoutes('*');
  }
}
