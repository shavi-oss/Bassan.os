import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../../src/modules/auth/auth.service";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");

describe("AuthService.login - organization suspend", () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let configService: any;

  beforeEach(() => {
    prisma = {
      _unsafeClient: {
        user: { findUnique: jest.fn() },
        refreshToken: { create: jest.fn().mockResolvedValue({}) },
      },
    };
    jwtService = { sign: jest.fn().mockReturnValue("access-tok") };
    configService = { get: jest.fn().mockReturnValue("15m") };
    service = new AuthService(prisma, jwtService, configService);
  });

  it("BLOCKS login when the organization is suspended (isActive=false)", async () => {
    prisma._unsafeClient.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "a@b.c",
      passwordHash: "x",
      isActive: true,
      organization: { id: "o1", isActive: false },
      roles: [],
    });
    await expect(
      service.login({ email: "a@b.c", password: "p" } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("ALLOWS login when the organization is active", async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    prisma._unsafeClient.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "a@b.c",
      passwordHash: "x",
      isActive: true,
      organization: { id: "o1", isActive: true },
      roles: [],
    });
    const res = await service.login({
      email: "a@b.c",
      password: "p",
    } as any);
    expect(res.accessToken).toBe("access-tok");
  });
});
