import { IsEmail, IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;

  @IsOptional()
  @IsBoolean({ message: 'isMobile debe ser un valor booleano' })
  isMobile?: boolean;
}
