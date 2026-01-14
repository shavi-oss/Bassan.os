import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../src/prisma/prisma.service";
import { ClsModule } from "nestjs-cls";
import { PrismaTenantExtension } from "../src/core/database/prisma.extension";

/**
 * Basic Tenant Isolation Tests
 *
 * Tests that PrismaService is properly configured with CLS and extension.
 */
describe("Tenant Isolation", () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ClsModule.forRoot()],
      providers: [PrismaTenantExtension, PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    await prismaService.onModuleInit();
  });

  afterEach(async () => {
    await prismaService.onModuleDestroy();
  });

  it("should be defined", () => {
    expect(prismaService).toBeDefined();
  });

  it("should return an extended client", () => {
    const client = prismaService.client;
    expect(client).toBeDefined();
    // The client should NOT be the same object as prismaService (it's extended)
    expect(client).not.toBe(prismaService);
  });
});
