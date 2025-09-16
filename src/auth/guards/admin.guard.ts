// src/auth/guards/admin.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        // Get the request object from the execution context
        const request = context.switchToHttp().getRequest();

        // Get the user from the request (this is attached by the JwtAuthGuard)
        const user = request.user;

        // Check if the user exists and if their role is 'admin'
        if (user && user.role === UserRole.ADMIN) {
            return true; // Allow access
        }

        // If not an admin, deny access
        throw new ForbiddenException('Access denied. Admin role required.');
    }
}