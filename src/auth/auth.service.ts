import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';
import { compare } from "bcrypt";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private userService: UserService,
        private jwtService: JwtService
    ) {}

    async validateUser(dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.username)

        if(user && (await compare(dto.password, user.password))) {
            const { password, ...result } = user;
            return result;
        }

        throw new UnauthorizedException();
    };

    async login(dto: LoginDto) {
        const user = await this.validateUser(dto);
        const payload = {
            name: user.email,
            sub: {
                name: user.name
            },
        };

        return {
            user,
            backendToken: {
                accessToken: await this.jwtService.signAsync(payload, {
                    expiresIn: '1h',
                    secret: process.env.JWT_SECRET_KEY,
                }),
                refreshToken: await this.jwtService.signAsync(payload, {
                    expiresIn: '7d',
                    secret: process.env.JWT_REFRESH_KEY,
                })
            }
        }
    }
}
