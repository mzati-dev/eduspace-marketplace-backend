// src/auth/jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service'; // import UsersService

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService, // inject UsersService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token not found');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);

            // Fetch the full user from DB using sub (user ID)
            const user = await this.usersService.findById(payload.sub);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Attach full user object to request.user
            request.user = user;

        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}


// // src/auth/jwt-auth.guard.ts
// import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { Request } from 'express';

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//     constructor(private jwtService: JwtService) { }

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const request = context.switchToHttp().getRequest();
//         const token = this.extractTokenFromHeader(request);

//         if (!token) {
//             throw new UnauthorizedException();
//         }

//         try {
//             const payload = await this.jwtService.verifyAsync(token);
//             request.user = payload;
//         } catch {
//             throw new UnauthorizedException();
//         }

//         return true;
//     }

//     private extractTokenFromHeader(request: Request): string | undefined {
//         const [type, token] = request.headers.authorization?.split(' ') ?? [];
//         return type === 'Bearer' ? token : undefined;
//     }
// }