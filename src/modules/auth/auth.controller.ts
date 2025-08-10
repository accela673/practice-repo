import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { LoginDto, RegisterDto } from './dto/auth-dto';
import { AuthService } from './auth.service';

@ApiTags('auth') // Группа в Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован.',
  })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiResponse({ status: 200, description: 'Токен выдан.' })
  async login(@Body() body: LoginDto) {
    // ...
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Получить профиль авторизованного пользователя' })
  getProfile(@Request() req) {
    return req.user;
  }
}
