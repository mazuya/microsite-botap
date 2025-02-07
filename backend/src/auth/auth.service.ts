import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // JWT for users (via LINE login)
  async generateUserJwt(user: any) {
    const payload = { lineId: user.lineId, sub: user.userId };
    return this.jwtService.sign(payload);
  }

  // JWT for admins (via admin login)
  async generateAdminJwt(admin: any) {
    const payload = {
      adminId: admin.adminId,
      role: admin.role,
      sub: admin.adminId,
    };
    return this.jwtService.sign(payload);
  }
}
