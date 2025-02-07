// jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extract the token from the Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Reject expired tokens
      secretOrKey: configService.get<string>('JWT_SECRET'), // Secret key from .env
    });
  }

  // This method is called if the JWT is valid
  async validate(payload: any) {
    // ฟังก์ชันทำไรสักอย่าง หลังจาก jwt ผ่าน
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }
  
    // Attach necessary information based on the user type
    if (payload.lineId) {
      return { userId: payload.sub, lineId: payload.lineId }; // User-specific fields
    } else if (payload.adminId) {
      return { adminId: payload.sub, role: payload.role }; // Admin-specific fields
    } else {
      throw new UnauthorizedException('Invalid token payload');
    }
  }
  }

