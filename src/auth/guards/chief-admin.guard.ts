// // src/auth/guards/chief-admin.guard.ts
// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { UserRole } from 'src/users/entities/user.entity';

// @Injectable()
// export class ChiefAdminGuard implements CanActivate {
//     canActivate(context: ExecutionContext): boolean {
//         const request = context.switchToHttp().getRequest();
//         const user = request.user;
//         // This guard only allows users with the CHIEF_ADMIN role
//         return user && user.role === UserRole.CHIEF_ADMIN;
//     }
// }