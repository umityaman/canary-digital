# DEBUGGING GUIDE - TypeError in Accounting Component

## Error Details
```
TypeError: Cannot read properties of undefined (reading 'h2')
at oa (Accounting-BwudLyH-.js:2:30284)
```

## Analysis

### Likely Causes:
1. **Build Cache Issue**: Production build might have stale cache
2. **Import Order**: DESIGN_TOKENS not fully loaded before component renders
3. **Minification Issue**: Vite production build mangled the code incorrectly
4. **Concurrent Backend Issues**: 503 errors might be triggering race conditions

### Current Status:
- Frontend: ✅ Deployed with new bundles (Accounting-BwudLyH-.js, ExpenseTab-DvngAGLG.js)
- Backend: ⏳ Still deploying (503 errors after 25+ minutes)
- Error: Happens on page load, unrelated to API calls

## Solution Attempts

### Option 1: Wait for Backend (RECOMMENDED)
Backend deployment is taking unusually long. The TypeError might be a side effect of the 503 errors causing race conditions.

**Action**: Wait 10-15 more minutes, then test again.

### Option 2: Clear Browser Cache
The error might be from cached bundles mixing with new code.

**Action**:
1. Open DevTools (F12)
2. Right-click Refresh button
3. Select "Empty Cache and Hard Reload"
4. Try again

### Option 3: Rebuild Frontend
Force a clean build to eliminate any cache issues.

**Commands**:
```powershell
cd frontend
npm run build
# Or trigger new deployment by pushing empty commit
git commit --allow-empty -m "chore: rebuild frontend to fix TypeError"
git push origin main
```

### Option 4: Add Defensive Check
Add optional chaining to all DESIGN_TOKENS.typography usage.

**File**: `frontend/src/pages/Accounting.tsx`

**Change** (lines 1024, 1210, 1613):
```typescript
# Before:
className={`${DESIGN_TOKENS.typography.h2} ...`}

# After:
className={`${DESIGN_TOKENS?.typography?.h2 || 'text-xl font-semibold'} ...`}
```

This adds a fallback if DESIGN_TOKENS is undefined.

## Debugging Steps

### 1. Check if DESIGN_TOKENS is undefined
Add console.log to Accounting.tsx top:
```typescript
import { DESIGN_TOKENS } from '../styles/design-tokens'
console.log('DESIGN_TOKENS loaded:', DESIGN_TOKENS !== undefined)
console.log('typography.h2:', DESIGN_TOKENS?.typography?.h2)
```

### 2. Check Import Path
Verify import statement at line 30:
```typescript
import { card, button, input, badge, getStatGradient, DESIGN_TOKENS, cx } from '../styles/design-tokens'
```

Should work correctly (it does in local dev).

### 3. Check Vite Config
Verify no issues with alias or bundling:
```typescript
// frontend/vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // ...
})
```

## Test After Backend Stabilizes

1. **Run stability check**:
   ```powershell
   .\check-backend-stability.ps1
   ```

2. **If passes, test in browser**:
   - URL: https://canary-frontend-672344972017.europe-west1.run.app
   - Login: admin@canary.com / admin123
   - Navigate: Accounting > Receivables tab
   - Check: Does TypeError still occur?

3. **If error persists**:
   - Implement Option 4 (defensive checks)
   - Or rebuild frontend (Option 3)

## Expected Timeline

- **21:55 - 22:05**: Backend should stabilize (40-50 min total deploy time)
- **22:06**: Run browser test
- **22:07**: If TypeError persists, implement defensive checks
- **22:15**: Redeploy frontend if needed
- **22:25**: Final verification

## Notes

- Backend deployment is taking unusually long (normal: 5-10 min, current: 25+ min)
- This might indicate resource constraints or cold start issues
- Consider setting `min-instances: 1` in Cloud Run to prevent cold starts
- The TypeError might self-resolve once backend is stable

---

**Last Updated**: November 8, 2025 21:54
**Status**: ⏳ Waiting for backend deployment
**Next Check**: 22:00 (run stability script)
