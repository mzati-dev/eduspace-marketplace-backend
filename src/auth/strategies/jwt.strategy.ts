// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'your-secret',
        });
    }

    async validate(payload: any) {
        console.log("--- INSIDE JWT STRATEGY ---");
        console.log("Received JWT Payload:", payload);
        const user = await this.usersService.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.isVerified) {
            throw new UnauthorizedException('Account not verified');
        }

        // ⭐ The crucial change is here:
        // You MUST return the full user object from the database lookup,
        // which includes all properties like 'id', 'email', and 'role'.
        return user;
    }
}
// // src/auth/jwt.strategy.ts
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { UsersService } from 'src/users/users.service'; // Assuming you have a UsersService

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//     constructor(private readonly usersService: UsersService) { // ⭐ Inject the UsersService
//         super({
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//             ignoreExpiration: false,
//             secretOrKey: process.env.JWT_SECRET || 'your-secret',
//         });
//     }

//     async validate(payload: any) {
//         // ⭐ Add this logic to validate the user
//         const user = await this.usersService.findById(payload.sub);

//         if (!user) {
//             throw new UnauthorizedException('User not found');
//         }

//         if (!user.isVerified) {
//             throw new UnauthorizedException('Account not verified');
//         }

//         return user;
//     }
// }

// // import { Injectable } from '@nestjs/common';
// // import { PassportStrategy } from '@nestjs/passport';
// // import { ExtractJwt, Strategy } from 'passport-jwt';

// // @Injectable()
// // export class JwtStrategy extends PassportStrategy(Strategy) {
// //     constructor() {
// //         super({
// //             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// //             ignoreExpiration: false,
// //             secretOrKey: process.env.JWT_SECRET || 'your-secret',
// //         });
// //     }

// //     async validate(payload: any) {
// //         return { id: payload.sub, email: payload.email };
// //     }
// // }
