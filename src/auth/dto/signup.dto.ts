import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class SignupDto {
  @IsString()
  @MinLength(4)
  @IsNotEmpty()
  readonly name: string;

  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  readonly password: string;
}
