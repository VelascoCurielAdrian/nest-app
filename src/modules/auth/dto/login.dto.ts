import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

// DTO para el inicio de sesión
export class LoginDto {
  @IsNotEmpty({ message: 'El username es requerido' })
  @IsString({ message: 'El username debe ser una cadena de texto' })
  username: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;

  @IsOptional()
  @IsBoolean({ message: 'isMobile debe ser un valor booleano' })
  isMobile?: boolean;
}
