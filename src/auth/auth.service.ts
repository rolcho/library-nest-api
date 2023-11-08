import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signupDto: SignupDto): Promise<{ token: string }> {
    const { name, email, password } = signupDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    const role =
      (await this.userModel.countDocuments({})) === 0 ? 'admin' : 'user';
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    const token = await this.jwtService.signAsync({ id: user._id, role: role });
    return { token };
  }

  async signIn(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }
    const token = await this.jwtService.signAsync({
      id: user._id,
      role: user.role,
    });
    return { token };
  }
}
