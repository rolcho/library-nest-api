import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let authService: AuthService;
  let authController: AuthController;

  const mockAuthService = {
    signUp: jest.fn().mockResolvedValueOnce({ token: 'authToken' }),
    login: jest.fn().mockResolvedValueOnce({ token: 'authToken' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    it('should register new user and return token', async () => {
      const mockNewUser = {
        name: 'My Name',
        email: 'myemail@gmail.com',
        password: 'Password123',
      };

      const result = await authController.signUp(mockNewUser as SignupDto);

      expect(authService.signUp).toHaveBeenCalled();
      expect(result).toStrictEqual({ token: 'authToken' });
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const mockLoginUser = {
        email: 'myemail@gmail.com',
        password: 'Password123',
      };

      const result = await authController.login(mockLoginUser as LoginDto);

      expect(authService.login).toHaveBeenCalled();
      expect(result).toStrictEqual({ token: 'authToken' });
    });
  });
});
