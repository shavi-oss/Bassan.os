import { ForbiddenException } from "@nestjs/common";
import { PermissionsGuard } from "../../src/shared/guards/permissions.guard";

describe("PermissionsGuard", () => {
  let guard: PermissionsGuard;
  let reflector: any;
  let prisma: any;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    prisma = { client: { user: { findUnique: jest.fn() } } };
    guard = new PermissionsGuard(reflector as any, prisma);
  });

  const makeCtx = (user: any) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as any;

  it("allows a route that has NO @RequirePermission (no enforcement)", async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    await expect(
      guard.canActivate(makeCtx({ id: "u1", organizationId: "o1" })),
    ).resolves.toBe(true);
    expect(prisma.client.user.findUnique).not.toHaveBeenCalled();
  });

  it("allows a user with the Admin role (superuser bypass)", async () => {
    reflector.getAllAndOverride.mockReturnValue({
      resource: "roles",
      action: "write",
    });
    prisma.client.user.findUnique.mockResolvedValue({
      id: "u1",
      roles: [{ role: { name: "Admin", permissions: [] } }],
    });
    await expect(
      guard.canActivate(makeCtx({ id: "u1", organizationId: "o1" })),
    ).resolves.toBe(true);
  });

  it("allows when the user holds the required permission", async () => {
    reflector.getAllAndOverride.mockReturnValue({
      resource: "roles",
      action: "write",
    });
    prisma.client.user.findUnique.mockResolvedValue({
      id: "u1",
      roles: [
        {
          role: {
            name: "User",
            permissions: [{ resource: "roles", action: "write" }],
          },
        },
      ],
    });
    await expect(
      guard.canActivate(makeCtx({ id: "u1", organizationId: "o1" })),
    ).resolves.toBe(true);
  });

  it("throws ForbiddenException when the user lacks the permission", async () => {
    reflector.getAllAndOverride.mockReturnValue({
      resource: "roles",
      action: "write",
    });
    prisma.client.user.findUnique.mockResolvedValue({
      id: "u1",
      roles: [
        {
          role: {
            name: "User",
            permissions: [{ resource: "leads", action: "read" }],
          },
        },
      ],
    });
    await expect(
      guard.canActivate(makeCtx({ id: "u1", organizationId: "o1" })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
