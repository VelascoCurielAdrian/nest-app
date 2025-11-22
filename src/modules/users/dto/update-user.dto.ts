import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

// DTO para actualizar un usuario
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string | null;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
