import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { NotificationAuthService } from './notification-auth.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, NotificationAuthService],
})
export class AuthModule {}
