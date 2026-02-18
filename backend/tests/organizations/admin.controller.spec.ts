import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { AdminController } from "../../src/modules/admin/admin.controller";
import { AdminService } from "../../src/modules/admin/admin.service";

describe("AdminController", () => {
  let controller: AdminController;
  let adminService: jest.Mocked<AdminService>;

  const mockAdminService = {
    createOrganization: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get(AdminService);
    jest.clearAllMocks();
  });

  describe("createOrganization", () => {
    const validDto = {
      name: "TestOrg",
      adminEmail: "admin@test.com",
      adminPassword: "Pass123!",
      adminFirstName: "Admin",
      adminLastName: "User",
    };

    const mockReq = { user: { sub: "service-account-001" } };

    it("should return 201 with valid S2S payload", async () => {
      const mockResult = {
        organization: { id: "org-123", name: "TestOrg" },
        user: { id: "user-456", email: "admin@test.com" },
      };
      mockAdminService.createOrganization.mockResolvedValue(mockResult);

      const result = await controller.createOrganization(
        validDto as any,
        mockReq,
        "corr-001",
      );

      expect(result).toEqual(mockResult);
      expect(adminService.createOrganization).toHaveBeenCalledWith(validDto, {
        performedBy: "service-account-001",
        correlationId: "corr-001",
      });
    });

    it("should generate correlationId if X-Correlation-Id header is absent", async () => {
      mockAdminService.createOrganization.mockResolvedValue({
        organization: { id: "org-123" },
        user: {},
      });

      await controller.createOrganization(validDto as any, mockReq, undefined);

      const callArgs = adminService.createOrganization.mock.calls[0][1];
      expect(callArgs.correlationId).toMatch(/^admin-\d+-[a-z0-9]+$/);
    });

    it("should throw BadRequestException if organizationId is present in body", async () => {
      const dtoWithOrgId = { ...validDto, organizationId: "org-evil" };

      await expect(
        controller.createOrganization(dtoWithOrgId as any, mockReq, "corr-002"),
      ).rejects.toThrow(BadRequestException);

      expect(adminService.createOrganization).not.toHaveBeenCalled();
    });

    it("should use performedBy from req.user.sub", async () => {
      mockAdminService.createOrganization.mockResolvedValue({
        organization: { id: "org-123" },
        user: {},
      });

      await controller.createOrganization(
        validDto as any,
        { user: { sub: "suite-service-v2" } },
        "corr-003",
      );

      expect(adminService.createOrganization).toHaveBeenCalledWith(
        validDto,
        expect.objectContaining({ performedBy: "suite-service-v2" }),
      );
    });

    it("should propagate errors from AdminService", async () => {
      mockAdminService.createOrganization.mockRejectedValue(
        new Error("Service error"),
      );

      await expect(
        controller.createOrganization(validDto as any, mockReq, "corr-004"),
      ).rejects.toThrow("Service error");
    });
  });
});
