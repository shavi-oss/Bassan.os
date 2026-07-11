import { Controller, Get } from "@nestjs/common";

/**
 * AppController — Minimal health endpoint.
 *
 * Phase 2 fix: Add /health for Railway healthcheck and monitoring.
 * Zero auth dependencies — public endpoint by design.
 * Evidence: forensic-audit-2026-02-28-v2 Phase 2 stage P2-D.
 */
@Controller()
export class AppController {
  @Get("health")
  health() {
    return { status: "ok" };
  }
}
