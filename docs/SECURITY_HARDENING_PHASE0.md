# 🛡️ Bassan.OS — Security Hardening (Phase 0) — Documentation

**Date:** 2026-07-11
**Author:** Hermes Agent (Shavi)
**Status:** ✅ Code complete & verified · ⏳ Pending governance-gate landing decision
**Scope:** Bassan.OS backend (`backend/`)

---

## 1. Context (لماذا)

خلال مراجعة CTO لمعمارية Bassan.OS kernel، اتلقوا الفجوات الحرجة دي:

- 🔴 **RBAC غير مُفعّل على مستوى الـ API** — أي يوزر موثّق في التانت يقدر يستدعي أي endpoint من غير فحص صلاحية.
- 🔴 **تعطيل الشركة (suspend) معطوب** — `auth.service.login` كان بيفحص `user.isActive` بس، مش `organization.isActive`، فشركة معطلة تقدر تدخل.
- 🟠 **مفيش rate-limiting** على `/auth/login` (خطر brute-force).
- 🟠 **ميدلوير ميت/غير آمن** `src/middleware/tenant.middleware.ts` بيثق في هيدر `x-tenant-id` (مش موصّل حالياً بس خطر لو اتوصّل).
- 🟠 **JWT_SECRET افتراضي ضعيف** في `.env.example`.
- 🟡 **مفيش security headers**.

---

## 2. التعديلات اللي اتعملت

### 2.1 ملفات جديدة (New files)

| الملف | الغرض |
|------|-------|
| `src/shared/decorators/require-permission.decorator.ts` | ديكوريتور `@RequirePermission(resource, action)` عشان نحدد الصلاحية المطلوبة على كل مسار |
| `src/shared/guards/permissions.guard.ts` | بيفرض الـ RBAC داخل التانت (Admin = superuser، غيره يتفحص Role → Permission) |
| `src/shared/guards/throttle.guard.ts` | Rate limiter في الذاكرة (5 طلب / 60 ثانية لكل IP+مسار) — بدون مكتبة جديدة |

### 2.2 ملفات مُعدّلة (Modified files)

| الملف | التغيير |
|------|--------|
| `src/modules/auth/auth.service.ts` | إصلاح suspend في `login` + `refresh` |
| `src/shared/shared.module.ts` | تسجيل `PermissionsGuard` و `ThrottleGuard` |
| `src/modules/roles/roles.controller.ts` | `@RequirePermission("roles","write")` على `create` و `assignPermissions` |
| `src/modules/users/users.controller.ts` | `@RequirePermission("users","write")` على `create` |
| `src/modules/auth/auth.controller.ts` | `@ThrottleGuard` على `POST /auth/login` |
| `src/app.module.ts` | إزالة توصيل الميدلوير الميت `TenantMiddleware` |
| `src/main.ts` | إضافة security headers (X-Content-Type-Options, X-Frame-Options, X-XSS, HSTS) |
| `.env.example` | تقوية `JWT_SECRET` + تحذير |

### 2.3 أهم الأكواد (Key snippets)

**إصلاح suspend — `auth.service.ts` (`login`):**
```ts
if (!user || !user.isActive || !user.organization?.isActive) {
  throw new UnauthorizedException("Invalid credentials");
}
```

**إصلاح suspend — `auth.service.ts` (`refresh`):**
```ts
const token = await this.db.refreshToken.findUnique({
  where: { token: refreshToken },
  include: { user: { include: { organization: true } } },
});
if (!token || token.revokedAt || token.expiresAt < new Date()) {
  throw new UnauthorizedException("Invalid refresh token");
}
if (!token.user.isActive || !token.user.organization?.isActive) {
  throw new UnauthorizedException("Invalid refresh token");
}
```

**الـ decorator — `require-permission.decorator.ts`:**
```ts
export const REQUIRE_PERMISSION_KEY = "require_permission";
export const RequirePermission = (resource: string, action: string) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, { resource, action });
```

**الـ guard — `permissions.guard.ts` (اللبّ):** يقرأ الصلاحيات من الداتا عبر `prisma.client.user.findUnique` (tenant-scoped)؛ لو مفيش `@RequirePermission` على المسار يعدّي؛ لو اليوزر `Admin` يعدّي (superuser)؛ غير كده يتفحص `Role → Permission` ويطلع `403` لو ناقصه.

**الـ throttle — `throttle.guard.ts`:** خريطة `Map<ip:route, {count, resetAt}>`؛ لو تجاوز 5/دقيقة يرمي `429`.

**headers — `main.ts`:**
```ts
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  next();
});
```

---

## 3. التحقق (Verification)

- `npm run build` → ✅ **ناجح** (صفر أخطاء).
- التيستات الجديدة:
  - `tests/security/permissions.guard.spec.ts` → ✅ **PASS**
  - `tests/security/suspend.spec.ts` → ✅ **PASS**
  - الإجمالي للتيستات الجديدة: **11 passed**.
- `npm test` الكلي: **11 passed / 4 failed** — الـ 4 الفاشلين كلهم بوابة الحوكمة (Security Linter) مش منطق الكود (انظر §4).

---

## 4. ⚠️ بوابة الحوكمة (محتاجة قرار)

الريبو فيه `tests/security/security-linter.spec.ts` بيفرض قواعد (S2-L1..L6, S3-L7) بتعتبر ملفات Stage 0-2 **Immutable** وتمنع تعديلها المباشر + قوائم سماح للموديولات/الـ endpoints. تعديلاتنا على:
`auth.service.ts`, `auth.controller.ts`, `roles.controller.ts`, `users.controller.ts`, `shared.module.ts`
**بتكسر القاعدة دي (S3-L7).**

- البوابة دي **كانت فاشلة أصلاً قبل أي تعديل مننا** (فيها `SCOPE VIOLATION` في `scheduled-triggers.controller.ts`) → يعني الـ CI كان أحمر من قبل.
- خيارات الإنزال (في انتظار قرار المستخدم):
  - **(أ)** نحدّث الـ linter عشان يسمح باستثناء الأمان ده (نرفع `BASSAN_PATCH`).
  - **(ب)** نعيد الهيكلة في `SecurityHardeningModule` مستقل (لسه محتاج لمس `login` للـ suspend).
  - **(ج)** نتجاوز الـ linter لهذا الـ PR الأمني (مبرر: بيقوّي الأمان أصلاً).

---

## 5. حاجات لسه معملتهاش (Pending)

- **تصحيح `INTEGRATION_CONTRACT_CORE.md`** في ريبو **suite-shavi** (بيقول "مفيش S2S" والكور بيعمله) — ريبو تاني، لسه.
- **حذف الملف الخطر الميت** `src/middleware/tenant.middleware.ts` (غير موصّل حالياً) — محتاج موافقة منفصلة عشان مسح.
- **Rate limiting للإنتاج:** نستبدل `ThrottleGuard` (في الذاكرة) بـ `@nestjs/throttler` + Redis لو شغّلنا أكتر من نسخة (instance).

---

## 6. الخطوات الجاية

في انتظار قرار المستخدم على §4 عشان نعمل commit/PR. **مفيش أي حاجة اتعملها push** — كل الشغل محلي على النسخة المستنسخة.
