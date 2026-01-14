
# Bassan.os Phase 0: Ironclad Core - Execution Plan

## تاريخ الخطة
**التاريخ**: 2026-01-08
**المسؤول**: Principal Architect
**المراجعة**: System Audit

---

## هدف Phase 0

تأمين multi-tenancy قبل أي feature آخر

---

## الخطوات المطلوبة

### الخطوة 1: Multi-Tenancy Foundation ✅
**الملفات**:
- ✅ tenant.middleware.ts (تم إنشاؤه)
- ✅ prisma.service.ts (موجود، يستخدم CLS)
- ✅ schema_with_rls.prisma (بديل مقترح)
- ✅ 001_add_rls_policies.sql (بديل مقترح)

**القرار المأخوذ**:
- استخدام CLS pattern بدلاً من RLS
- الحفاظ على الكود الموجود
- توثيق القرار في ADR-005

**الحالة**: مكتملة

---

### الخطوة 2: Multi-Tenancy Tests
**الملفات المطلوبة**:
- auth.service.spec.ts
- tenant.e2e.spec.ts

**ما لا نلمسه**:
- أي feature test

**السبب**:
- بدون tests، لا نعرف إذا isolation يعمل

**النجاح**:
- test يفشل عند محاولة cross-tenant access
- test ينجح عند access داخل tenant
- كل test يمر green

**الحالة**: لم تبدأ بعد

---

### الخطوة 3: Auth Hardening
**الملفات المطلوبة**:
- auth.service.ts (تعزيز)
- jwt-auth.guard.ts (تعزيز)

**ما لا نلمسه**:
- أي feature endpoint

**السبب**:
- auth هو gatekeeper لكل شيء

**النجاح**:
- JWT token يحتوي organizationId
- refresh token مرتبط بـ tenant
- auth guard يتحقق من tenant

**الحالة**: لم تبدأ بعد

---

### الخطوة 4: First Verified Module
**الملفات المطلوبة**:
- users/ (module جديد)
- users.controller.ts
- users.service.ts

**ما لا نلمسه**:
- أي module آخر

**السبب**:
- نحتاج module واحد مكتمل كـ proof of concept

**النجاح**:
- CRUD operations تعمل
- multi-tenancy محفوظ
- tests تمر

**الحالة**: لم تبدأ بعد

---

## قواعد التنفيذ

### 1. organizationId Law
- organizationId موجود في CLS context فقط
- لا يظهر في application code
- لا يمر في DTOs
- لا يظهر في API responses

### 2. Prisma Access Law
- PrismaService يمكن الوصول إليه من:
  * Repository layer فقط
  * Service layer عبر repositories
- لا direct access من controllers
- لا manual filters

### 3. Error Behavior Law
- 404: Resource not found (داخل tenant)
- 403: Access denied (cross-tenant)
- 401: Not authenticated
- 422: Business rule violation

### 4. Forbidden Patterns
- ❌ `WHERE organizationId = ?` في application code
- ❌ manual tenant checks
- ❌ trust على frontend data
- ❌ bypass CLS

### 5. Multi-Tenancy Law
- كل query يجب أن يمر عبر CLS
- tenant context يجب أن يكون معين
- tests يجب أن تثبت isolation
- لا cross-tenant access مطلقاً

---

## شروط الإنجاز

### Phase 0 مكتملة عندما:

1. ✅ كل multi-tenant test يمر green
2. ✅ CLS context يعمل بشكل صحيح
3. ✅ auth module محمي
4. ✅ users module مكتمل ومختبر

---

## ما لا نفعله

- ❌ لا كتابة أي business feature
- ❌ لا إنشاء أي endpoint جديد
- ❌ لا تطوير أي frontend feature
- ❌ لا تخطي tests

---

## الترتيب الصحيح

1. Multi-Tenancy Foundation ✅
2. Multi-Tenancy Tests (التالية)
3. Auth Hardening (بعد Tests)
4. First Verified Module (بعد Auth)

---

## التوقف

لا ننتقل إلى Phase 1 حتى:
- كل multi-tenancy test يمر green
- CLS context يعمل بشكل صحيح
- auth module محمي
- users module مكتمل ومختبر

---

**تم التحضير بواسطة**: Principal Architect
**التاريخ**: 2026-01-08
**الحالة**: جاهز للتنفيذ
