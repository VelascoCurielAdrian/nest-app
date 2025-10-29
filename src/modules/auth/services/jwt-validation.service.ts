import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtValidationService {
  private readonly logger = new Logger(JwtValidationService.name);

  constructor(private readonly jwtService: JwtService) {}

  async verifyToken(token: string): Promise<{ sub: string; username: string; iat: number; exp: number }> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; username: string; iat: number; exp: number }>(token);

      // Log para debug
      this.logger.debug(`Token verified successfully for user: ${payload.username} (${payload.sub})`);
      this.logger.debug(`Token expires at: ${new Date(payload.exp * 1000).toISOString()}`);

      return payload;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Token verification failed: ${errorMessage}`);
      this.logger.debug(`Failed token: ${token.substring(0, 20)}...`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
