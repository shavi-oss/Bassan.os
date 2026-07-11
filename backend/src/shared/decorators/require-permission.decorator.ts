import { SetMetadata } from "@nestjs/common";

export const REQUIRE_PERMISSION_KEY = "require_permission";

/**
 * Marks a route as requiring a specific permission.
 * Used together with PermissionsGuard.
 *
 * Example: @RequirePermission("roles", "write")
 */
export const RequirePermission = (resource: string, action: string) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, { resource, action });
