# Copilot Instructions for CANARY Equipment Rental System

## Project Overview
CANARY is a **professional camera & equipment rental management system** with enterprise-grade accounting. It's a monorepo with TypeScript full-stack: React frontend, Node.js/Express backend, PostgreSQL database (Prisma ORM), and React Native mobile app.

**Production URLs:**
- Frontend: https://canary-frontend-672344972017.europe-west1.run.app
- Backend: https://canary-backend-672344972017.europe-west1.run.app
- Repo: https://github.com/umityaman/canary-digital

**Current Focus:** Enterprise accounting automation (92/100 system score). See `Documents/ACCOUNTING_MODULE_COMPREHENSIVE_ANALYSIS.md` for detailed status.

---

## Architecture & Critical Patterns

### 1. Monorepo Structure
```
/backend     - Express API (port 4000 in prod, 3000 in dev)
/frontend    - React + Vite (port 5173)
/mobile      - React Native + Expo
/Documents   - Comprehensive progress reports & architecture docs
```
**Dev Start:** Run `start-dev.bat` (Windows) to launch both servers automatically. See `README.md` for Docker setup.

### 2. Database Schema - Turkish Accounting Core
The schema uses **Turkish accounting standards** with double-entry bookkeeping:
- **ChartOfAccounts** (not "Account") - Turkish chart of accounts (100-899 codes)
- **JournalEntry** + **JournalEntryItem** - Double-entry transactions
- **AccountCard** - Customer/supplier ledgers (cari hesap)
- **StockMovement** - Inventory tracking linked to invoices/orders
- **Invoice → Order → OrderItem → Equipment** - Core rental flow

**Critical:** Database model naming matters. If you see `prisma.account`, it's wrong - use `prisma.chartOfAccounts`. See `backend/prisma/schema.prisma` (3500+ lines).

### 3. Service Layer Pattern
Backend uses class-based services with automated integrations:
```typescript
// Example: AccountingService (backend/src/services/accounting.service.ts)
export class AccountingService {
  async createIncome(data) { /* ... */ }
  async getTrialBalanceReport() { /* Uses ChartOfAccounts + JournalEntryItem */ }
}
```
**Key Services:**
- `InvoiceService` - Auto-triggers `StockMovementService` on invoice creation (commit: 17059bb)
- `JournalEntryService` - Auto-records double-entry from payments (commit: a43fe22)
- Bank API services use **abstract base class** pattern (`BaseBankService`)

**When adding features:** Maintain this automation chain. Invoice creation → stock movement → journal entry must flow automatically.

### 4. Authentication & Middleware
JWT-based auth with Zustand state management:
- Backend: `backend/src/middleware/auth.ts` exports `authenticateToken`
- Frontend: `frontend/src/stores/authStore.ts` (Zustand store)
- Token stored in localStorage: `auth_token` + `user_data`

**Security Stack:** Helmet.js, tiered rate limiting (100/min general, 5/15min auth), CORS whitelist includes Vercel preview URLs.

### 5. Route Registration Order Matters
In `backend/src/app.ts`, routes are loaded via `safeLoadRoute()` with specific ordering:
```typescript
// Specific routes FIRST
safeLoadRoute('/api/accounting/journal-entries', './routes/journalEntries', ...);
safeLoadRoute('/api/accounting/chart-of-accounts', './routes/chartOfAccounts', ...);
// General catch-all LAST
safeLoadRoute('/api/accounting', './routes/accounting', ...);
```
**Why:** Express matches routes first-come-first-served. Put specific paths before wildcards.

---

## Development Workflows

### Quick Start (Windows)
```powershell
start-dev.bat              # Start both servers
stop-dev.bat               # Kill all node processes
restart-dev.bat            # Quick restart
```

### Database Operations
```bash
cd backend
npx prisma generate        # Regenerate client after schema changes
npx prisma db push         # Push schema to PostgreSQL (production uses this, not migrations)
npx prisma db seed         # Seed test data (see prisma/seed.ts)
node check-data.ts         # Verify database state
```
**Production DB:** GCP Cloud SQL PostgreSQL. Connection via `DATABASE_URL` secret (Cloud Run auto-injects).

### Testing Strategy
Limited test coverage currently (see `backend/tests/`):
- Integration tests for auth (`auth.test.ts`)
- Route tests for checks module (`checks.routes.test.ts`)
- **Run:** `npm test` in backend workspace

**Production Testing:** Use PowerShell scripts:
- `production-test.ps1` - Smoke tests for 10 critical endpoints
- `test-einvoice-api.ps1` - GIB e-invoice integration tests
- Results logged to `production-test-results_[timestamp].txt`

### Deployment (GCP Cloud Run)
**Auto-deploy:** Push to `main` triggers `.github/workflows/deploy-backend-v2.yml` + `deploy-frontend.yml`
- Backend: `gcloud run deploy canary-backend` (Dockerfile in backend/)
- Frontend: Vite build → Cloud Run static serving
- Secrets: `JWT_SECRET`, `DATABASE_URL`, bank API keys stored in GCP Secret Manager

**Manual Deploy (Emergency):**
```powershell
cd frontend
npm run build
cd ..
.\quick-deploy-simple.ps1  # 30-second deploy, bypasses CI cache issues
```
See `Documents/FRONTEND_DEPLOYMENT_GUIDE.md` for troubleshooting.

---

## Project-Specific Conventions

### 1. Frontend Components - Atomic Structure
Located in `frontend/src/components/`:
- `accounting/` - 20+ accounting UI components (mix of real API + mock data - see reports)
- `common/` - Reusable UI primitives
- `modals/` - Modal dialogs for forms
- Use **Toast notifications** for user feedback (via Zustand store in `Toast.tsx`)

**Known Issue:** Some accounting components still use mock data. Check `Documents/FRONTEND_API_INTEGRATION_REPORT.md` for status.

### 2. API Response Format
All endpoints return:
```json
{ "success": true, "data": {...}, "message": "..." }
// Or on error:
{ "success": false, "error": "Message" }
```

### 3. Logging Pattern
Backend uses Winston logger (`backend/src/config/logger.ts`):
```typescript
import logger from '../config/logger';
logger.info('Operation completed', { userId, orderId });
logger.error('Failed to process', { error: err.message });
```
**Production:** Logs streamed to GCP Cloud Logging. Sentry integration currently disabled (TypeScript errors).

### 4. Turkish Language Constants
Many enums/statuses use Turkish:
- Invoice status: `"PENDING"`, `"PAID"`, `"CANCELLED"` (English in DB)
- UI labels: Turkish (see `frontend/src/` components)
- Error messages: Mixed English/Turkish

---

## Integration Points & Dependencies

### External APIs
1. **GIB e-Invoice** (`backend/src/services/gib-soap.service.ts`)
   - SOAP-based integration with Turkish Revenue Administration
   - Test credentials in `.env.example`
   - See `Documents/GIB_EINVOICE_INTEGRATION_COMPLETE.md`

2. **Bank APIs** (`backend/src/services/bankAPI/`)
   - Akbank (OAuth 2.0), Garanti BBVA (HMAC), İş Bankası (Cert-based)
   - Cron jobs: Daily sync 2 AM, hourly 9 AM-6 PM (`scheduler.ts`)
   - Docs: `Documents/BANK_API_INTEGRATION_COMPLETE.md`

3. **WhatsApp (Twilio)** - 10 message templates, auto-send on order confirm
4. **Email (SendGrid)** - 11 Handlebars templates + cron schedulers
5. **Booqable/Google Calendar** - Optional sync (partial implementation)

### Frontend-Backend Communication
Use Axios client in `frontend/src/services/api.ts`:
```typescript
import { accountingAPI } from '../services/api';
const response = await accountingAPI.getJournalEntries();
```
**Auth:** Interceptor auto-attaches `Authorization: Bearer ${token}` from Zustand store.

---

## Critical Known Issues & Workarounds

### 1. ChartOfAccounts vs Account Model
**Problem:** Early code used `prisma.account` but schema only has `ChartOfAccounts`.
**Solution:** Always use `prisma.chartOfAccounts`. Fixed in accounting reports (commit: 957f632).

### 2. Route Ordering Conflicts
**Problem:** `/api/accounting` catching requests meant for `/api/accounting/journal-entries`.
**Solution:** Register specific routes before catch-all routes in `app.ts` (lines 150-250).

### 3. Frontend Mock Data
**Status:** 25% of accounting UI components still use mock data instead of API calls.
**Fix Plan:** See `Documents/FRONTEND_API_INTEGRATION_REPORT.md` for component-by-component status.

### 4. GCP Secrets in CI/CD
**Issue:** GCP_SA_KEY must be minified JSON (no newlines) in GitHub Secrets.
**Workaround:** Use `jq -c` to compress before pasting into GitHub UI.

---

## Documentation Map
**Start Here:**
- `README.md` - Quick start, features, tech stack
- `Documents/ACCOUNTING_MODULE_COMPREHENSIVE_ANALYSIS.md` - 400+ line deep dive into accounting flow
- `Documents/QUICK_WINS_COMPLETED.md` - Recent automation achievements (Invoice→Stock→Journal)

**For Specific Tasks:**
- Deployment: `Documents/CI_CD_DEPLOYMENT_SUCCESS_REPORT.md`
- Bank APIs: `Documents/BANK_API_INTEGRATION_COMPLETE.md`
- e-Invoice: `Documents/GIB_EINVOICE_INTEGRATION_COMPLETE.md`
- Frontend Status: `Documents/FRONTEND_API_INTEGRATION_REPORT.md`

**Daily Reports:** `Documents/GUN_SONU_RAPORU_[date].md` - Progress tracking since Oct 2025

---

## AI Coding Best Practices for This Codebase

### When Adding Accounting Features
1. **Check schema first:** `backend/prisma/schema.prisma` line 1-3589
2. **Maintain automation chain:** Invoice → StockMovement → JournalEntry (see `InvoiceService.createRentalInvoice()`)
3. **Use ChartOfAccounts** for GL accounts (not "Account" model)
4. **Add route with safeLoadRoute()** in `app.ts` (line 150+)

### When Debugging API Errors
1. Check route registration order in `app.ts`
2. Verify model name in Prisma queries (`ChartOfAccounts`, not `Account`)
3. Check Winston logs in terminal for stack traces
4. Test endpoint with production-test scripts

### When Modifying Frontend
1. Update Zustand store if adding state (`stores/authStore.ts` pattern)
2. Use Toast notifications for feedback (not alert())
3. Check if component uses mock data → replace with API call from `services/api.ts`
4. Follow atomic component structure in `components/`

### When Updating Database Schema
1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma generate` (updates TypeScript types)
3. Run `npx prisma db push` (applies to PostgreSQL)
4. Update affected services (grep for model name)
5. Test with `node check-data.ts` or `check-db-counts.js`

---

**Last Updated:** November 12, 2025  
**System Score:** 92/100 (from 60/100 in Jan 2025)  
**Next Priority:** Accounting UI completion (JournalEntry/ChartOfAccounts management screens)
