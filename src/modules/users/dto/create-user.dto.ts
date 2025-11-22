import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

// DTO para crear un usuario
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string | null;
}
