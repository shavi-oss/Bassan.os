import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AdminJwtStrategy } from "../../src/modules/admin/admin-jwt.strategy";

describe("AdminJwtStrategy", () => {
  let strategy: AdminJwtStrategy;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "ADMIN_JWT_SECRET") return "test-admin-secret";
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminJwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<AdminJwtStrategy>(AdminJwtStrategy);
  });

  describe("validate", () => {
    it("should return principal for valid S2S token with type:s2s", async () => {
      const payload = {
        sub: "suite-service-001",
        type: "s2s",
        iss: "https://suite.bassan.io",
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        sub: "suite-service-001",
        type: "s2s",
        scope: undefined,
        iss: "https://suite.bassan.io",
      });
    });

    it("should return principal for valid S2S token with scope:bassan:admin", async () => {
      const payload = {
        sub: "suite-service-002",
        scope: "bassan:admin read:orgs",
        iss: "https://suite.bassan.io",
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        sub: "suite-service-002",
        type: undefined,
        scope: "bassan:admin read:orgs",
        iss: "https://suite.bassan.io",
      });
    });

    it("should return principal for valid S2S token with aud:bassan:admin", async () => {
      const payload = {
        sub: "suite-service-003",
        aud: "bassan:admin",
        iss: "https://suite.bassan.io",
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        sub: "suite-service-003",
        type: undefined,
        scope: undefined,
        iss: "https://suite.bassan.io",
      });
    });

    it("should return principal for valid S2S token with aud as array containing bassan:admin", async () => {
      const payload = {
        sub: "suite-service-004",
        aud: ["bassan:admin", "other:service"],
        iss: "https://suite.bassan.io",
      };

      const result = await strategy.validate(payload);

      expect(result).toMatchObject({ sub: "suite-service-004" });
    });

    it("should throw UnauthorizedException if sub is missing", async () => {
      const payload = {
        type: "s2s",
        scope: "bassan:admin",
      };

      await expect(strategy.validate(payload as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if type is not s2s and no bassan:admin scope or aud", async () => {
      const payload = {
        sub: "regular-user-001",
        type: "user",
        scope: "read:profile",
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if payload has no type, scope, or aud", async () => {
      const payload = { sub: "unknown-001" };

      await expect(strategy.validate(payload as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if scope does not include bassan:admin", async () => {
      const payload = {
        sub: "service-003",
        scope: "read:orgs write:users",
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should NOT include organizationId in returned principal", async () => {
      const payload = {
        sub: "suite-service-001",
        type: "s2s",
        organizationId: "org-injected",
      };

      const result = await strategy.validate(payload as any);

      expect(result).not.toHaveProperty("organizationId");
    });
  });
});
