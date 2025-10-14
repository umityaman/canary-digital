# 📧 Email Service Setup Guide

## Gmail SMTP Configuration for Canary ERP

### 🎯 Overview
Canary ERP uses Gmail SMTP to send automated emails including:
- 📦 Order confirmations
- 🔧 Technical service notifications
- 💰 Payment reminders
- 📅 Appointment reminders

---

## 🔧 Setup Steps

### 1️⃣ Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click **"2-Step Verification"**
3. Follow the setup wizard
4. Complete phone number verification

### 2️⃣ Create App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **"Mail"** as the app
3. Select **"Other (Custom name)"** as the device
4. Enter: **"Canary ERP"**
5. Click **"Generate"**
6. **Copy the 16-digit password** (format: xxxx-xxxx-xxxx-xxxx)

### 3️⃣ Configure Environment Variables

#### **Local Development (.env file):**

```bash
# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # 16-digit app password
EMAIL_FROM=your-email@gmail.com
```

#### **Production (Railway):**

```bash
railway variables set EMAIL_USER=your-email@gmail.com
railway variables set EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
railway variables set EMAIL_FROM=your-email@gmail.com
```

### 4️⃣ Restart Backend

```bash
# Local
cd backend
npm run dev

# Production (Railway)
# Automatic restart after setting environment variables
```

---

## ✅ Test Email Service

### **Test 1: Basic Email Test**

```bash
curl -X POST http://localhost:4000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"to": "recipient@gmail.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email başarıyla gönderildi!",
  "to": "recipient@gmail.com",
  "messageId": "<message-id>"
}
```

### **Test 2: Order Confirmation Email**

```bash
curl -X POST http://localhost:4000/api/test/order-email \
  -H "Content-Type: application/json"
```

**Email Content:**
- Order number: ORD-TEST-001
- Customer name: Test Kullanıcı
- Equipment: Sony A7III, Canon 24-70mm, Manfrotto Tripod
- Date range: 15-20 Ekim 2025
- Total: 5000 TL

### **Test 3: Technical Service Notification**

```bash
curl -X POST http://localhost:4000/api/test/techservice-email \
  -H "Content-Type: application/json"
```

**Email Content:**
- Ticket number: TKT-TEST-001
- Equipment: Sony A7III Kamera
- Status: İşleme Alındı
- Description: Sensor cleaning issue

---

## 🚨 Troubleshooting

### Problem: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution:**
- ✅ 2-Step Verification enabled?
- ✅ Using App Password (not regular password)?
- ✅ Copied password correctly (remove spaces)?

### Problem: "Less secure app access"

**Solution:**
Gmail App Passwords work regardless of "less secure app" setting. Use App Password, not regular password.

### Problem: "Daily sending limit exceeded"

**Solution:**
Gmail free accounts have sending limits:
- New accounts: ~100 emails/day
- Established accounts: ~500 emails/day
- Consider upgrading to Google Workspace for higher limits

### Problem: Emails going to spam

**Solution:**
- Add your domain to SPF records
- Set up DKIM
- Consider using a custom domain email
- For production, consider Postmark, SendGrid, or AWS SES

---

## 📊 Email Service Status

### Check Configuration:

```bash
# View environment variables
railway variables

# Check logs
railway logs --tail

# Look for: "✅ Gmail SMTP initialized successfully"
```

### Verify in Code:

File: `backend/src/utils/emailService.ts`

```typescript
if (EMAIL_USER && EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    }
  });
  logger.info('✅ Gmail SMTP initialized successfully');
}
```

---

## 🎯 Production Checklist

- [ ] 2-Step Verification enabled
- [ ] App Password generated
- [ ] Railway environment variables set:
  - [ ] EMAIL_USER
  - [ ] EMAIL_PASSWORD
  - [ ] EMAIL_FROM
- [ ] Backend restarted
- [ ] Test email sent successfully
- [ ] Order confirmation email sent successfully
- [ ] Technical service email sent successfully
- [ ] Emails received in inbox (not spam)
- [ ] Email templates look correct

---

## 📝 Notes

- **App Password Format:** 16 characters (xxxx-xxxx-xxxx-xxxx)
- **Spaces:** Remove all spaces when copying password
- **Security:** Never commit EMAIL_PASSWORD to Git
- **Rotation:** Consider rotating App Password every 90 days
- **Multiple Services:** Each service (mail, calendar, etc.) needs its own App Password

---

## 🔗 Useful Links

- [Google Account Security](https://myaccount.google.com/security)
- [App Passwords](https://myaccount.google.com/apppasswords)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Nodemailer Documentation](https://nodemailer.com/about/)

---

## 📞 Support

If you encounter issues:
1. Check Railway logs: `railway logs --tail`
2. Verify environment variables: `railway variables`
3. Test locally first: `npm run dev`
4. Check Gmail account security settings

**Last Updated:** October 12, 2025
