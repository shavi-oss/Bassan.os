# VERIFICATION EVIDENCE: Post-Purge History Audit

## INC-2026-RSA-001 — Phase D: All Checks Must Pass

**Executed:** 2026-02-24T03:47 UTC+2  
**Branch at time of checks:** `fix/secure-keys`

> [!IMPORTANT]
> All 8 verification checks below are PASS. No exception. This document must not be marked VERIFIED unless every check returns the expected result verbatim.

---

## VD-1: Old Commit Object — DESTROYED

```
$ git cat-file -e e80d19564c134d548573dcb8575214139e94c32e
CATFILE_EXIT:1
```

**Expected:** non-zero exit (object not found)  
**Result:** EXIT:1 ✅ **DESTROYED**

---

## VD-2: Old Commit Type — FATAL ERROR (Object Does Not Exist)

```
$ git cat-file -t e80d19564c134d548573dcb8575214139e94c32e
fatal: git cat-file: could not get object info
CATFILE_T_EXIT:128
```

**Expected:** error / "not a valid object name"  
**Result:** EXIT:128 — `fatal: git cat-file: could not get object info` ✅ **DESTROYED**

---

## VD-3: File Path Absent from ALL History

```
$ git log --all --oneline -- "backend/tools/jwks/admin-private.pem"
[empty output]
LOG_EXIT:0
```

**Expected:** empty output  
**Result:** ✅ **EMPTY — no commit references this path in any ref**

---

## VD-4: Blob Object Absent from Object Database

```
$ git rev-list --all --objects | findstr /i "admin-private.pem"
[no output]
FINDSTR_EXIT:1
```

**Expected:** no matches (FINDSTR exit 1 = not found)  
**Result:** ✅ **NO MATCH — blob `b9a8d747ba92af03306480389d96c49e8a37202c` is purged**

---

## VD-5: No Private Key Markers in Working Tree

```
$ git grep -n "BEGIN PRIVATE KEY"
backend/governance/PR-101-admin-onboarding/POST_MERGE_EXECUTION_REPORT.md: git grep "BEGIN PRIVATE KEY"
backend/governance/PR-101-admin-onboarding/PR_CORE_FINAL_PREMERGE_EXECUTION_REPORT.md: git grep "BEGIN PRIVATE KEY"
[...other governance docs that reference the pattern as a command string]
scripts/secret-scan.sh:  "-----BEGIN PRIVATE KEY-----"
GREP_PK_EXIT:0
```

**Expected:** Only doc strings and scanner pattern lists — no real PEM body  
**Result:** ✅ **Only in governance docs (command references) and secret-scan.sh (pattern list). No actual PEM block data.**

---

## VD-6: No RSA Private Key Markers in Working Tree

```
$ git grep -n "BEGIN RSA PRIVATE KEY"
backend/governance/.../PR_CORE_SECURE_KEYS_VERIFICATION_EVIDENCE.md: git grep "BEGIN RSA PRIVATE KEY"
scripts/secret-scan.sh:  "-----BEGIN RSA PRIVATE KEY-----"
GREP_RSA_EXIT:0
```

**Expected:** Only doc strings and scanner pattern lists — no real PEM body  
**Result:** ✅ **Only in governance docs and secret-scan.sh. No actual private key data.**

---

## VD-7: Old SHA Unreachable from Any Branch

```
$ git branch -a --contains e80d19564c134d548573dcb8575214139e94c32e
error: no such commit e80d19564c134d548573dcb8575214139e94c32e
BRANCH_CONTAINS_EXIT:129
```

**Expected:** no branches (or error: no such commit)  
**Result:** EXIT:129 — `error: no such commit` ✅ **SHA IS GONE FROM ALL REFS**

Note: Before purge, this returned `remotes/origin/fix/ui-relocation`. That branch is now rewritten with a new SHA and the old SHA no longer exists.

---

## VD-8: No `.pem` Paths in Object Database

```
$ git rev-list --all --objects | findstr /i ".pem"
[no output]
PEM_SEARCH_EXIT:1
```

**Expected:** no matches  
**Result:** ✅ **NO MATCH — no .pem file path exists anywhere in reachable object graph**

---

## Summary Table

| Check | Command                                            | Expected    | Result                                |
| ----- | -------------------------------------------------- | ----------- | ------------------------------------- |
| VD-1  | `git cat-file -e e80d195...`                       | exit ≠ 0    | EXIT:1 ✅                             |
| VD-2  | `git cat-file -t e80d195...`                       | error       | `fatal: could not get object info` ✅ |
| VD-3  | `git log --all -- admin-private.pem`               | empty       | (empty) ✅                            |
| VD-4  | `git rev-list --objects \| grep admin-private.pem` | no match    | FINDSTR:1 ✅                          |
| VD-5  | `git grep "BEGIN PRIVATE KEY"`                     | docs only   | docs/scripts only ✅                  |
| VD-6  | `git grep "BEGIN RSA PRIVATE KEY"`                 | docs only   | docs/scripts only ✅                  |
| VD-7  | `git branch -a --contains e80d195...`              | no branches | `error: no such commit` ✅            |
| VD-8  | `git rev-list --objects \| grep .pem`              | no match    | FINDSTR:1 ✅                          |

**RESULT: 8/8 PASS**

---

## Final System State

```
══════════════════════════════════════════════════════════
SYSTEM STATE: STABLE
═══════════════════════════════════════════════════════════
Old SHA:       e80d19564c134d548573dcb8575214139e94c32e — DESTROYED
Old blob:      b9a8d747ba92af03306480389d96c49e8a37202c — PURGED
Old key path:  backend/tools/jwks/admin-private.pem — ABSENT
All branches:  Force-pushed with rewritten SHAs (14 branches)
All tags:      Force-pushed with rewritten SHAs (21 tags)
Old key:       admin-key-1 (PERMANENTLY REVOKED)
Active key:    admin-key-2 (served from ADMIN_JWKS_B64 only)
Endpoint:      HTTP 200 | kid: admin-key-2 | d/p/q: absent
══════════════════════════════════════════════════════════
```
