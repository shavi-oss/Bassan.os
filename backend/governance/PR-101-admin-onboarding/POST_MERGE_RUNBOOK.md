# POST_MERGE_RUNBOOK.md

## Scope

Post-merge actions required after `fix/secure-keys` merges to `master` in BassanOs.
**Execute these steps in order immediately after merge.**

---

## Step 1 — Railway Redeploy

Trigger a fresh deploy of the `jwks-server` service so the new `index.js` starts up
and reads `ADMIN_JWKS_PAYLOAD` from Railway secrets.

```bash
# Option A: Railway CLI
railway redeploy --service jwks-server

# Option B: Railway Dashboard
# → Project: Basos-pr101-sandbox (or the merged production project)
# → Service: jwks-server
# → Deployments → "Trigger Redeploy"
```

Wait for deployment to reach status `ACTIVE` before proceeding to Step 2.

---

## Step 2 — JWKS Endpoint Verification

After redeploy, confirm the endpoint serves the new key:

```bash
# Must return HTTP 200
curl -s https://jwks-server-production.up.railway.app/health

# Must contain kid=admin-key-2 and no private fields
curl -s https://jwks-server-production.up.railway.app/.well-known/jwks.json | jq .

# Pass criteria:
#   .keys[0].kid == "admin-key-2"
#   .keys[0] | has("d") == false
#   .keys[0] | has("p") == false
#   .keys[0] | has("q") == false
```

**If verification fails → roll back immediately (see Step 6).**

---

## Step 3 — Key Revocation Notice

- `admin-key-1` is now permanently revoked
- Any JWT signed with `admin-key-1` will fail verification at the BFF (`ADMIN_JWKS_URL`)
- No direct action needed — the new JWKS endpoint will only advertise `admin-key-2`
- Notify downstream service owners that `admin-key-1` is no longer valid

---

## Step 4 — Team Git Reset (REQUIRED — History Was Rewritten)

Send this to all developers with local clones of BassanOs:

```bash
# ─── For developers on master branch ───
git fetch --all
git reset --hard origin/master

# ─── For developers on feature branches ───
git fetch --all
git rebase origin/master   # or: git checkout -b new-branch-name origin/master

# ─── If rebase becomes complex: fresh clone ───
cd ..
rm -rf BassanOs
git clone https://github.com/shavi-oss/Bassan.os.git

# ─── Any stale local branch pointing at old commits ───
git checkout master
git branch -D old-branch-name
git checkout -b old-branch-name origin/master
```

> ⚠️ WARNING: `git pull` alone will NOT work correctly after a force-push history rewrite.
> Developers MUST use `git reset --hard origin/master` or re-clone.

---

## Step 5 — Install Pre-Commit Hook (Each Developer)

Prevents future accidental commits of key material:

```bash
# From BassanOs repo root
cp scripts/pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Verify
git diff --staged   # trigger on next commit to test hook runs
```

---

## Step 6 — Rollback Plan

If `jwks-server` fails to start after redeploy:

1. **Check logs:**

   ```bash
   railway logs --service jwks-server --tail 50
   ```

2. **Common cause:** `ADMIN_JWKS_PAYLOAD` env var not set or malformed JSON.

3. **Verify variable exists:**

   ```bash
   railway variables --service jwks-server | grep ADMIN_JWKS_PAYLOAD
   ```

4. **If variable is missing:** Re-set it:

   ```bash
   # Value must be the JWKS JSON of the NEW RSA public key (kid=admin-key-2)
   # Do NOT commit the value — set via CLI only:
   railway variables set "ADMIN_JWKS_PAYLOAD={...}" --service jwks-server
   railway redeploy --service jwks-server
   ```

5. **If code is broken:** Revert the merge on GitHub (use "Revert" button on the merged PR).
   Then fix and re-open PR.

6. **Do NOT roll back the git history rewrite.** The backup bundle exists at:
   `D:\Basaan os\BassanOs-backup-pre-purge.bundle`
   Contact the security team before using it.

---

## Step 7 — Final Confirmation Checklist

- [ ] Railway redeploy complete — status: ACTIVE
- [ ] `GET /.well-known/jwks.json` → `kid == "admin-key-2"` confirmed
- [ ] No private fields (`d`, `p`, `q`) in JWKS response
- [ ] All developers notified and re-synced to `origin/master`
- [ ] Pre-commit hook installed on all dev machines
- [ ] `.env.example` comment updated to reference `admin-key-2`
- [ ] Old `admin-key-1` revocation communicated to downstream services

---

_Runbook produced: 2026-02-23T21:44 UTC+2_
_Authority: PR-CORE-FINAL-PREMERGE-VERDICT_
