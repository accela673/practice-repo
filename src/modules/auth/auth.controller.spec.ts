import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<Record<keyof AuthService, jest.Mock>>;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      validateUser: jest.fn(),
      login: jest.fn(),
      confirmUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should call authService.register with correct data', async () => {
      const dto = { email: 'test@example.com', password: 'pass123' };
      authService.register.mockResolvedValue({ success: true });

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true });
    });
  });

  describe('login', () => {
    it('should return token when credentials are valid', async () => {
      const loginDto = { email: 'test@example.com', password: 'pass123' };
      const user = { id: 1, email: loginDto.email };
      authService.validateUser.mockResolvedValue(user);
      authService.login.mockReturnValue({ access_token: 'token' });

      const result = await controller.login(loginDto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual({ access_token: 'token' });
    });

    it('should throw UnauthorizedException if invalid credentials', async () => {
      const loginDto = { email: 'bad@example.com', password: 'wrong' };
      authService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('confirmUser', () => {
    it('should call authService.confirmUser with email and code', async () => {
      const dto = { email: 'test@example.com', code: '123456' };
      authService.confirmUser.mockResolvedValue({ confirmed: true });

      const result = await controller.confirmUser(dto);

      expect(authService.confirmUser).toHaveBeenCalledWith(dto.email, dto.code);
      expect(result).toEqual({ confirmed: true });
    });
  });

  describe('getProfile', () => {
    it('should return user from request', () => {
      const user = { id: 1, email: 'test@example.com' };
      const req = { user };

      const result = controller.getProfile(req);

      expect(result).toBe(user);
    });
  });
});
