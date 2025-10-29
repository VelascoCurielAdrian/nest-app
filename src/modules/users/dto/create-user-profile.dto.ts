import { IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateUserProfileDto {
  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsUUID()
  profile_id?: string;

  @IsString()
  @MaxLength(255)
  first_name: string;

  @IsString()
  @MaxLength(255)
  last_name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  gender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  local_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone_number?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}
