import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { NotificationAuthService } from './notification-auth.service.js';
import { ParrainageRecompenseService } from './parrainage-recompense.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, NotificationAuthService, ParrainageRecompenseService],
  exports: [ParrainageRecompenseService],
})
export class AuthModule {}
