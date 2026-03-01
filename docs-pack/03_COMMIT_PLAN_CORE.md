# 03 — Commit Plan: Core (shavi-oss/Bassan.os)

**Date:** 2026-03-01  
**Branch:** master

---

## Commit Groups

### Commit C1 — e2e Verification Evidence

**Message:** `docs(e2e-final): add e2e verification evidence pack`

**Tag:** `docs-core-20260301-01-e2e-final`

**Files:**

```
governance/e2e-final/01_CHANGELOG_PER_FILE.md
governance/e2e-final/02_EXECUTION_REPORT.md
governance/e2e-final/03_VERIFICATION_MATRIX.md
governance/e2e-final/04_VERDICT.md
```

**git add command:**

```bash
git add governance/e2e-final/01_CHANGELOG_PER_FILE.md \
        governance/e2e-final/02_EXECUTION_REPORT.md \
        governance/e2e-final/03_VERIFICATION_MATRIX.md \
        governance/e2e-final/04_VERDICT.md
```

**Scope proof:** `git diff --cached --name-only` must show exactly these 4 files, all `.md`.

---

## docs-pack Commit (this gate's artifacts)

After C1, commit the docs-pack itself:

**Message:** `docs(gate): add docs-pack gate artifacts`

**Files:**

```
docs-pack/00_DOCS_INVENTORY_CORE.md
docs-pack/01_SCOPE_COMPLIANCE_CORE.md
docs-pack/02_DOCS_STRUCTURE_CORE.md
docs-pack/03_COMMIT_PLAN_CORE.md
```

> Note: `04_VERIFICATION_MATRIX_CORE.md` and `05_FINAL_DOCS_VERDICT_CORE.md` will be added in a subsequent patch after commits complete.

---

## Summary

| #      | Commit                                                | Files | Tag                               |
| ------ | ----------------------------------------------------- | ----- | --------------------------------- |
| C1     | `docs(e2e-final): add e2e verification evidence pack` | 4     | `docs-core-20260301-01-e2e-final` |
| C-pack | `docs(gate): add docs-pack gate artifacts`            | 4+    | (no tag — metadata only)          |
