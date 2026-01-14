#!/usr/bin/env ts-node
/**
 * 🛡️ Security Audit Script
 * 
 * Scans the codebase for common security violations:
 * 1. Direct Prisma access (bypasses tenant filtering)
 * 2. organizationId in DTOs (trust boundary violation)
 * 3. Any type usage (type safety violation)
 * 4. Raw SQL queries (injection risk)
 * 
 * Usage: npx ts-node scripts/security-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface Violation {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

const violations: Violation[] = [];
const projectRoot = path.join(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

// Colors for console output
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function scanFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = path.relative(projectRoot, filePath);

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // CRITICAL: Direct Prisma access without .client
    if (
      line.includes('this.prisma.') && 
      !line.includes('this.prisma.client') &&
      !line.includes('this.prisma.$') &&
      !line.includes('// @security-ignore') &&
      !filePath.includes('prisma.service.ts')
    ) {
      if (!line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        violations.push({
          file: relativePath,
          line: lineNum,
          column: line.indexOf('this.prisma'),
          rule: 'no-direct-prisma',
          message: 'Direct Prisma access bypasses tenant filtering. Use this.prisma.client instead.',
          severity: 'CRITICAL',
        });
      }
    }

    // HIGH: organizationId in DTO files
    if (
      filePath.includes('.dto.') &&
      line.includes('organizationId') &&
      !line.trim().startsWith('//') &&
      !line.includes('@security-ignore')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        column: line.indexOf('organizationId'),
        rule: 'no-orgid-in-dto',
        message: 'organizationId should not be in DTOs. It must come from CLS context only.',
        severity: 'HIGH',
      });
    }

    // HIGH: Raw SQL queries
    const rawSqlPatterns = ['$queryRaw', '$executeRaw', '$queryRawUnsafe', '$executeRawUnsafe'];
    rawSqlPatterns.forEach(pattern => {
      if (line.includes(pattern) && !line.includes('override') && !line.includes('// blocked')) {
        violations.push({
          file: relativePath,
          line: lineNum,
          column: line.indexOf(pattern),
          rule: 'no-raw-sql',
          message: `Raw SQL (${pattern}) bypasses tenant filtering and is an injection risk.`,
          severity: 'HIGH',
        });
      }
    });

    // MEDIUM: Manual organizationId filtering
    if (
      (line.includes("where: { organizationId") || line.includes("where: {organizationId")) &&
      !filePath.includes('.spec.') &&
      !filePath.includes('.test.') &&
      !filePath.includes('prisma.extension.ts') &&
      !line.includes('// @security-ignore')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        column: line.indexOf('organizationId'),
        rule: 'no-manual-tenant-filter',
        message: 'Manual organizationId filtering detected. Use CLS auto-injection instead.',
        severity: 'MEDIUM',
      });
    }

    // MEDIUM: Any type usage
    if (
      line.includes(': any') && 
      !line.includes('// eslint-disable') &&
      !line.includes('// @type-ignore') &&
      !filePath.includes('.d.ts')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        column: line.indexOf(': any'),
        rule: 'no-any-type',
        message: 'Usage of "any" type reduces type safety.',
        severity: 'MEDIUM',
      });
    }

    // LOW: X-Tenant-Id or X-Organization-Id headers
    if (
      (line.toLowerCase().includes('x-tenant-id') || 
       line.toLowerCase().includes('x-organization-id') ||
       line.toLowerCase().includes('x-org-id')) &&
      !line.trim().startsWith('//')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        column: 0,
        rule: 'no-tenant-header',
        message: 'Tenant ID must come from validated JWT, not headers.',
        severity: 'LOW',
      });
    }
  });
}

function findTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      files.push(...findTypeScriptFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function printReport(): void {
  console.log('\n' + BOLD + '═══════════════════════════════════════════════════════════════' + RESET);
  console.log(BOLD + '                   🛡️  SECURITY AUDIT REPORT                    ' + RESET);
  console.log(BOLD + '═══════════════════════════════════════════════════════════════' + RESET + '\n');

  const critical = violations.filter(v => v.severity === 'CRITICAL');
  const high = violations.filter(v => v.severity === 'HIGH');
  const medium = violations.filter(v => v.severity === 'MEDIUM');
  const low = violations.filter(v => v.severity === 'LOW');

  console.log(`${RED}CRITICAL: ${critical.length}${RESET}`);
  console.log(`${YELLOW}HIGH:     ${high.length}${RESET}`);
  console.log(`MEDIUM:   ${medium.length}`);
  console.log(`LOW:      ${low.length}`);
  console.log(`TOTAL:    ${violations.length}\n`);

  if (violations.length === 0) {
    console.log(GREEN + '✅ No security violations found!' + RESET);
    return;
  }

  // Group by file
  const byFile = violations.reduce((acc, v) => {
    if (!acc[v.file]) acc[v.file] = [];
    acc[v.file].push(v);
    return acc;
  }, {} as Record<string, Violation[]>);

  for (const [file, fileViolations] of Object.entries(byFile)) {
    console.log(BOLD + `\n📄 ${file}` + RESET);
    
    for (const v of fileViolations) {
      const color = v.severity === 'CRITICAL' ? RED : 
                    v.severity === 'HIGH' ? YELLOW : RESET;
      console.log(`   ${color}[${v.severity}]${RESET} Line ${v.line}: ${v.message}`);
      console.log(`            Rule: ${v.rule}`);
    }
  }

  console.log('\n' + BOLD + '═══════════════════════════════════════════════════════════════' + RESET);
}

// Main execution
console.log('🔍 Scanning codebase for security violations...\n');

const tsFiles = findTypeScriptFiles(srcDir);
console.log(`Found ${tsFiles.length} TypeScript files to scan.\n`);

tsFiles.forEach(scanFile);

printReport();

// Exit with error code if critical/high violations found
const criticalOrHigh = violations.filter(v => v.severity === 'CRITICAL' || v.severity === 'HIGH');
if (criticalOrHigh.length > 0) {
  console.log(RED + `\n🚨 FAILED: ${criticalOrHigh.length} critical/high severity violations found.` + RESET);
  process.exit(1);
} else if (violations.length > 0) {
  console.log(YELLOW + `\n⚠️  WARNING: ${violations.length} medium/low severity issues found.` + RESET);
  process.exit(0);
} else {
  console.log(GREEN + '\n✅ PASSED: All security checks passed!' + RESET);
  process.exit(0);
}
