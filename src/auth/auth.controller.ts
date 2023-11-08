import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(
    @Body()
    signupDto: SignupDto,
  ): Promise<{ token: string }> {
    return this.authService.signUp(signupDto);
  }
}
