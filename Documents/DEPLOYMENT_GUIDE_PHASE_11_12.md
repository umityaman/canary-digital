# 🚀 Deployment Instructions - Phase 11 & 12

## 📋 What's Ready to Deploy

### ✅ Phase 11: Two-Factor Authentication (2FA)
**Backend Files:**
- `backend/src/routes/twoFactor.ts` (6 endpoints)
- `backend/src/services/sms.service.ts` (Twilio SMS)
- `backend/src/services/twoFactor.service.ts` (TOTP logic)
- `backend/src/services/otp.service.ts` (OTP generation)
- `backend/prisma/schema.prisma` (Updated User model)

**Frontend Files:**
- `frontend/src/components/TwoFactorSetup.tsx` (520 lines)
- `frontend/src/components/TwoFactorVerify.tsx` (220 lines)
- `frontend/src/components/BackupCodes.tsx` (320 lines)
- `frontend/src/pages/Profile.tsx` (Security tab added)

**Dependencies Added:**
```json
// Backend
"speakeasy": "^2.0.0",
"qrcode": "^1.5.3",
"twilio": "^4.19.0"
```

### ✅ Phase 12: Mobile App UI Polish
**Mobile Files:**
- `mobile/src/components/ui/Button.tsx` (320 lines)
- `mobile/src/components/ui/Card.tsx` (85 lines)
- `mobile/src/components/ui/Input.tsx` (180 lines)
- `mobile/src/components/ui/Badge.tsx` (160 lines)
- `mobile/src/components/ui/Chip.tsx` (200 lines)
- `mobile/src/components/ui/Avatar.tsx` (160 lines)
- `mobile/src/components/ui/Divider.tsx` (40 lines)
- `mobile/src/constants/theme.ts` (180 lines)

**Improved Screens:**
- `mobile/src/screens/home/HomeScreen.tsx`
- `mobile/src/screens/equipment/EquipmentListScreen.tsx`
- `mobile/src/components/EquipmentCard.tsx`
- `mobile/src/screens/equipment/EquipmentDetailScreen.tsx`

---

## 🔧 Deployment Steps

### Step 1: Environment Variables (CRITICAL!)

#### **Backend (Railway/Production Server)**
```bash
# Required for 2FA
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Existing variables (keep these)
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=3000
```

#### **Frontend (Vercel/Production Server)**
```bash
VITE_API_URL=https://your-backend-url.railway.app
```

---

### Step 2: Database Migration

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# OR create and run migration
npx prisma migrate dev --name add_two_factor_fields
npx prisma migrate deploy
```

**New User Fields Added:**
- `twoFactorEnabled` (Boolean)
- `twoFactorMethod` (String: 'totp' | 'sms')
- `twoFactorSecret` (String, nullable)
- `twoFactorPhone` (String, nullable)
- `twoFactorBackupCodes` (String[], array)
- `twoFactorVerifiedAt` (DateTime, nullable)
- `tempOTP` (String, nullable)
- `tempOTPExpiry` (DateTime, nullable)

---

### Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Mobile (if testing locally)
cd ../mobile
npm install
```

---

### Step 4: Build & Test Locally

```bash
# Backend
cd backend
npm run build
npm run dev  # Test locally

# Frontend
cd ../frontend
npm run build
npm run preview  # Test build

# Mobile
cd ../mobile
npm start  # Expo development server
```

---

### Step 5: Deploy to Production

#### **Option A: Using Vercel CLI (Frontend)**
```bash
cd frontend

# First time setup
vercel

# Production deployment
vercel --prod
```

#### **Option B: Using Railway CLI (Backend)**
```bash
cd backend

# Login to Railway
railway login

# Link to existing project (if not already linked)
railway link

# Deploy
railway up

# Run migrations on Railway
railway run npx prisma migrate deploy
```

#### **Option C: Git Push (Auto-deploy)**
If Vercel/Railway is connected to Git:
```bash
git add .
git commit -m "Phase 11 & 12: 2FA + Mobile UI Polish"
git push origin main
```

---

### Step 6: Verify Deployment

#### **Backend Health Check:**
```bash
curl https://your-backend.railway.app/health
```

#### **Test 2FA Endpoints:**
```bash
# Get 2FA status (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-backend.railway.app/api/2fa/status

# Test SMS sending (if configured)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"+901234567890"}' \
     https://your-backend.railway.app/api/2fa/send-otp
```

#### **Frontend Check:**
1. Open `https://your-frontend.vercel.app`
2. Login to your account
3. Navigate to Profile → Security tab
4. Verify 2FA setup interface appears

---

## 📱 Mobile App Notes

### Mobile App is NOT deployed to web servers!

Mobile apps require separate deployment:

#### **For Development:**
```bash
cd mobile
npm start
# Scan QR code with Expo Go app
```

#### **For Production (Future):**
```bash
# Build for iOS/Android
eas build --platform ios
eas build --platform android

# Submit to App Store / Google Play
eas submit
```

**Note:** Mobile app runs on user devices, not on servers.

---

## ⚠️ Critical Checks Before Deployment

### ✅ Pre-Deployment Checklist:

- [ ] **Twilio Credentials:** Added to Railway environment variables
- [ ] **Database Migration:** Run `prisma migrate deploy` on production
- [ ] **API URL:** Frontend points to correct backend URL
- [ ] **Build Success:** Both frontend and backend build without errors
- [ ] **Dependencies:** All new packages installed
- [ ] **TypeScript:** No compilation errors (already verified - 0 errors)
- [ ] **Git Commit:** All changes committed
- [ ] **Environment Variables:** All secrets configured

### ⚠️ Common Issues:

1. **Twilio SMS Not Working:**
   - Check Twilio credentials in Railway
   - Verify phone number format (+country code)
   - Check Twilio account balance

2. **2FA Endpoints 404:**
   - Ensure twoFactor routes registered in `app.ts`
   - Verify backend redeployed

3. **Prisma Client Errors:**
   - Run `npx prisma generate` after schema changes
   - Push schema to database with `npx prisma db push`

4. **Mobile App Not Loading:**
   - This is normal - mobile runs locally
   - Use `npm start` in mobile folder

---

## 📊 What's Deployed

### Backend (Railway):
- ✅ 6 new 2FA endpoints
- ✅ SMS service (Twilio integration)
- ✅ TOTP service (speakeasy)
- ✅ PDF generation service
- ✅ Updated Prisma schema

### Frontend (Vercel):
- ✅ 3 new 2FA modal components
- ✅ Security tab in Profile
- ✅ PDF download buttons
- ✅ Updated order/inventory pages

### Mobile (Local Development):
- ✅ 7 new UI components
- ✅ Theme system
- ✅ 3 improved screens
- ⏳ Not deployed to servers (runs on devices)

---

## 🎯 Quick Deploy Commands

### If Railway/Vercel is Git-Connected:
```bash
git push origin main
# Both services will auto-deploy
```

### Manual Deploy:
```bash
# Backend
cd backend
railway up

# Frontend
cd frontend
vercel --prod
```

---

## 📞 Support

If deployment fails:
1. Check Railway logs: `railway logs`
2. Check Vercel logs: `vercel logs`
3. Verify environment variables
4. Test locally first: `npm run dev`

---

## ✅ Success Indicators

After successful deployment:
- ✅ Frontend loads without errors
- ✅ Backend `/health` endpoint responds
- ✅ Profile → Security tab visible
- ✅ 2FA setup modal opens
- ✅ SMS OTP can be sent (if Twilio configured)
- ✅ TOTP QR code generates

---

**Total Changes:**
- 105 files changed
- 10,462 insertions
- 3,493 deletions

**Commit Hash:** `d22ca9c`
**Commit Message:** "Phase 11 & 12 Complete: 2FA + Mobile UI Polish"

**Ready for Production!** 🚀
