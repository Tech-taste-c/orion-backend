import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.email || !payload.type) {
      throw new UnauthorizedException('Invalid token');
    }
    
    return {
      id: payload.sub,
      email: payload.email,
      type: payload.type,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role
    };
  }
}


