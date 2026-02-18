import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * AdminJwtAuthGuard — Guard for admin-only S2S endpoints.
 *
 * PR-101: Uses the 'admin-jwt' Passport strategy registered in AdminModule.
 * Applied at class level on AdminController.
 * Fail-closed: unauthenticated requests receive 401 Unauthorized.
 */
@Injectable()
export class AdminJwtAuthGuard extends AuthGuard("admin-jwt") {}
