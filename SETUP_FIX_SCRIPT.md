# Bassan.os Project Setup & Fix Script

## Root Cause Analysis

All errors are caused by **missing node_modules**. The packages are defined in package.json but not installed yet.

### Backend Errors:

- `Cannot find module '@nestjs/common'` → npm install not run
- `Cannot find module '@prisma/client'` → Prisma client not generated
- `$connect` / `$disconnect` errors → Prisma client not generated

### Frontend Errors:

- `Cannot find module 'react'` → npm install not run
- `Cannot find module 'next'` → npm install not run
- `JSX element implicitly has type 'any'` → @types/react not installed
- `Cannot find name 'process'` → @types/node not installed

---

## Complete Fix Script

Run these commands in order:

### Step 1: Backend Setup

```powershell
# Navigate to backend
cd "D:\Basaan os\BassanOs\backend"

# Install dependencies (this installs all packages including @nestjs/common, @prisma/client, bcrypt, etc.)
npm install

# Generate Prisma client (this creates the PrismaClient class with $connect, $disconnect methods)
npx prisma generate

# Start PostgreSQL (make sure Docker Desktop is running first)
docker-compose up -d

# Wait for PostgreSQL to be ready (5 seconds)
Start-Sleep -Seconds 5

# Run database migrations (creates all tables)
npx prisma migrate dev --name init
```

### Step 2: Frontend Setup

```powershell
# Navigate to frontend
cd "D:\Basaan os\BassanOs\frontend"

# Install dependencies (this installs react, next, @types/react, @types/node, etc.)
npm install
```

### Step 3: Verify Everything Works

```powershell
# Terminal 1: Start backend
cd "D:\Basaan os\BassanOs\backend"
npm run start:dev

# Terminal 2: Start frontend
cd "D:\Basaan os\BassanOs\frontend"
npm run dev
```

---

## One-Command Setup (PowerShell)

Copy and paste this entire block into PowerShell:

```powershell
# Bassan.os Full Setup Script
Write-Host "=== Bassan.os Setup Script ===" -ForegroundColor Cyan

# Backend Setup
Write-Host "`n[1/6] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location "D:\Basaan os\BassanOs\backend"
npm install

Write-Host "`n[2/6] Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "`n[3/6] Starting PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "`n[4/6] Waiting for database..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n[5/6] Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init

# Frontend Setup
Write-Host "`n[6/6] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location "D:\Basaan os\BassanOs\frontend"
npm install

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "To start backend: cd backend && npm run start:dev" -ForegroundColor Cyan
Write-Host "To start frontend: cd frontend && npm run dev" -ForegroundColor Cyan
```

---

## What Each Step Fixes

| Step                     | Fixes                                                 |
| :----------------------- | :---------------------------------------------------- |
| `npm install` (backend)  | @nestjs/common, @prisma/client, bcrypt, passport, jwt |
| `npx prisma generate`    | $connect, $disconnect methods on PrismaService        |
| `docker-compose up`      | PostgreSQL database                                   |
| `npx prisma migrate`     | Creates database tables                               |
| `npm install` (frontend) | react, next, @types/react, @types/node                |

---

## After Running Script

### All These Errors Will Be Fixed:

**Backend:**

- ✅ `Cannot find module '@nestjs/common'`
- ✅ `Cannot find module '@prisma/client'`
- ✅ `Property '$connect' does not exist`
- ✅ `Property '$disconnect' does not exist`

**Frontend:**

- ✅ `Cannot find module 'react'`
- ✅ `Cannot find module 'next'`
- ✅ `Cannot find module 'next/link'`
- ✅ `Cannot find module 'next/navigation'`
- ✅ `Cannot find namespace 'React'`
- ✅ `JSX element implicitly has type 'any'`
- ✅ `Cannot find name 'process'`

---

## Troubleshooting

### If Docker is not running:

```powershell
# Start Docker Desktop first, then:
docker-compose up -d
```

### If TypeScript still shows errors after npm install:

```powershell
# Restart VS Code's TypeScript server
# Press: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### If Prisma migration fails:

```powershell
# Reset database and try again
npx prisma migrate reset --force
npx prisma migrate dev --name init
```

---

## Expected Result

After running the setup script:

1. **Backend** starts on `http://localhost:3000`
2. **Frontend** starts on `http://localhost:3001`
3. **No TypeScript errors** in VS Code
4. **Database** has all tables created

---

**Script Created**: 2026-01-08  
**Status**: Ready to run
