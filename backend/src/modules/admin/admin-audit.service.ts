import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

export interface AuditRecord {
  correlationId: string;
  entityType: string;
  entityId: string | null;
  action: string;
  performedBy: string;
  performedByService?: string;
  result: "success" | "failure" | "attempt";
  metadata?: Record<string, unknown>;
}

/**
 * AdminAuditService — Structured audit trail for admin operations.
 *
 * PR-101: Local audit service for the admin module.
 *
 * IMPLEMENTATION NOTE:
 * Writes JSON-lines to backend/logs/admin-audit.log.
 * This is an acceptable fallback for LDE evidence.
 *
 * TODO(governance): Replace with project-wide AuditService when available.
 * See: backend/governance/PR-101-admin-onboarding/PR_101_PLAN.md
 *
 * SECURITY CONTRACT:
 * - Does NOT log JWT tokens, passwords, or secrets.
 * - Fail-closed: if log write fails, throws so caller can abort.
 * - Structured JSON-lines format for easy parsing.
 */
@Injectable()
export class AdminAuditService {
  private readonly logger = new Logger(AdminAuditService.name);
  private readonly logDir: string;
  private readonly logFile: string;

  constructor() {
    // Resolve log directory relative to project root (backend/)
    this.logDir = path.resolve(__dirname, "../../../../logs");
    this.logFile = path.join(this.logDir, "admin-audit.log");
    this.ensureLogDir();
  }

  /**
   * Log an admin action. Fail-closed: throws on write failure.
   * Caller is responsible for catching and aborting the operation.
   */
  logAction(record: AuditRecord): void {
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      ...record,
    });

    try {
      fs.appendFileSync(this.logFile, entry + "\n", { encoding: "utf8" });
    } catch (err) {
      // Also emit to NestJS logger so it appears in stdout
      this.logger.error(
        `[AUDIT WRITE FAIL] correlationId=${record.correlationId} error=${err instanceof Error ? err.message : "unknown"}`,
      );
      // Re-throw so AdminService can abort the operation (fail-closed)
      throw err;
    }

    // Emit structured log to stdout as well (for log aggregators)
    this.logger.log(entry);
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }
}
