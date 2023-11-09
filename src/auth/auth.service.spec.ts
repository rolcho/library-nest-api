import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('BookService', () => {
  let authService: AuthService;
  let model: Model<User>;
  let jwtService: JwtService;

  const mockUser = {
    _id: '654b6757cb2dad9ea8d151f6',
    name: 'My Name',
    email: 'myemail@gmail.com',
    password: 'mypassword',
  };

  const mockAuthService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const token = 'jwtToken';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: getModelToken(User.name),
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    const signupDto = {
      name: 'My Name',
      email: 'myemail@gmail.com',
      password: 'mypassword',
    };

    it('should be create new user', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockUser) as any);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwtToken');

      const result = await authService.signUp(signupDto);

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result).toEqual({ token });
    });

    it('duplicate email throw ConflicException', async () => {
      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.reject({ code: 11000 }));

      await expect(authService.signUp(signupDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'myemail@gmail.com',
      password: 'mypassword',
    };

    it('should login user and return the token', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

      const result = await authService.login(loginDto);

      expect(result).toStrictEqual({ token });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);

      expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );
    });

    it('should throw UnauthorizedException if passwords does not match', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );
    });
  });
});
