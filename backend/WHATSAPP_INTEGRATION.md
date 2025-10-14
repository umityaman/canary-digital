# 💬 WhatsApp Integration Documentation

## 🎯 Overview

The WhatsApp integration allows the Canary Equipment Rental System to send automated notifications to customers via WhatsApp using the Twilio API. This provides instant communication for order confirmations, reminders, and payment notifications.

## 🚀 Features

### Automated Messages
- ✅ **Order Confirmation** - Sent immediately after order creation
- ✅ **Pickup Reminder** - Reminder on pickup day
- ✅ **Return Reminder** - Reminder on return day
- ✅ **Payment Reminder** - Payment due date notifications
- ✅ **Payment Confirmation** - Receipt after payment received
- ✅ **Invoice Sent** - Invoice delivery notification
- ✅ **Late Payment Warning** - Overdue payment alerts
- ✅ **Order Cancelled** - Cancellation and refund info
- ✅ **Welcome Message** - New customer onboarding
- ✅ **Equipment Damage Report** - Damage notification

### Message Templates
- 📝 10 pre-built Turkish message templates
- 🎨 Professional formatting with emojis
- 💼 Customizable per company
- 📊 Variable data injection

## 📂 File Structure

```
backend/src/
├── services/
│   └── whatsapp.service.ts          # Main WhatsApp service
├── routes/
│   ├── whatsapp-test.ts             # Testing endpoints
│   └── orders.ts                    # Order integration
└── index.ts                         # Service initialization
```

## 🔧 Setup & Configuration

### 1. Twilio Account Setup

#### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for free account
3. Verify your email and phone number

#### Step 2: Get Credentials
1. Navigate to https://console.twilio.com
2. Go to **Account > Account Info**
3. Copy your **ACCOUNT SID**
4. Copy your **AUTH TOKEN** (click "View" to reveal)

#### Step 3: WhatsApp Sandbox Setup (Development)
1. In Twilio Console, go to **Messaging > Try it out > Send a WhatsApp message**
2. Note the sandbox number (e.g., `+1 415 523 8886`)
3. Send the join code from your WhatsApp:
   ```
   join <your-sandbox-code>
   ```
4. You'll receive confirmation message
5. Now you can receive messages on your phone

#### Step 4: Production Setup (Optional)
For production use, you need:
1. **WhatsApp Business Profile** approval
2. **Facebook Business Manager** account
3. **Message Template** pre-approval
4. Twilio will guide you through the process

### 2. Environment Variables

Add to `backend/.env`:
```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID="AC1234567890abcdef1234567890abcdef"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
```

**Development vs Production:**
- **Development**: Use sandbox number (`whatsapp:+14155238886`)
- **Production**: Use your approved WhatsApp Business number (`whatsapp:+905551234567`)

### 3. Install Dependencies

Already installed:
```bash
cd backend
npm install twilio
```

## 📱 Usage

### Automatic Integration

WhatsApp messages are automatically sent when:
1. **Order Created** → Order confirmation sent
2. **Pickup Date** → Pickup reminder (scheduled)
3. **Return Date** → Return reminder (scheduled)
4. **Payment Due** → Payment reminder (scheduled)
5. **Payment Received** → Payment confirmation

### Manual Testing

#### Test Endpoints

All test endpoints require authentication. Base URL: `/api/test-whatsapp`

#### 1. Test Connection
```http
POST /api/test-whatsapp/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+905551234567"
}
```

**Response:**
```json
{
  "message": "WhatsApp test message sent successfully",
  "messageSid": "SM1234567890abcdef1234567890abcdef",
  "phoneNumber": "+905551234567"
}
```

#### 2. Test Order Confirmation
```http
POST /api/test-whatsapp/test-order-confirmation
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+905551234567"
}
```

#### 3. Test Pickup Reminder
```http
POST /api/test-whatsapp/test-pickup-reminder
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+905551234567"
}
```

#### 4. Test Return Reminder
```http
POST /api/test-whatsapp/test-return-reminder
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+905551234567"
}
```

#### 5. Test Payment Reminder
```http
POST /api/test-whatsapp/test-payment-reminder
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+905551234567"
}
```

#### 6. Test Payment Confirmation
```http
POST /api/test-whatsapp/test-payment-confirmation
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+905551234567"
}
```

#### 7. Get All Templates
```http
GET /api/test-whatsapp/templates
Authorization: Bearer <token>
```

## 📝 Message Templates

### 1. Order Confirmation
```
Merhaba {customerName}! 🎉

Siparişiniz başarıyla oluşturuldu.

📋 *Sipariş No:* {orderNumber}
💰 *Tutar:* {totalAmount} TL
📅 *Alış:* {pickupDate}
📅 *İade:* {returnDate}

Siparişiniz hazırlanıyor...
```

### 2. Pickup Reminder
```
Merhaba {customerName}! 📦

*Alış Hatırlatması*

Bugün ekipman alış gününüz!

📋 *Sipariş:* {orderNumber}
🕐 *Saat:* {pickupTime}
📦 *Ekipman:* {equipmentCount} adet
```

### 3. Return Reminder
```
Merhaba {customerName}! 🔄

*İade Hatırlatması*

Bugün ekipman iade gününüz!

📋 *Sipariş:* {orderNumber}
🕐 *Saat:* {returnTime}
📦 *İade Edilecek:* {equipmentCount} adet
```

### 4. Payment Reminder
```
Merhaba {customerName}! 💳

*Ödeme Hatırlatması*

📋 *Sipariş:* {orderNumber}
💰 *Kalan Tutar:* {dueAmount} TL
📅 *Son Tarih:* {dueDate}

Banka Bilgileri:
Canary Ekipman Kiralama
IBAN: TR00 0000 0000 0000 0000 0000 00
```

### 5. Payment Confirmation
```
Merhaba {customerName}! ✅

*Ödeme Alındı*

Ödemeniz başarıyla alındı!

📋 *Sipariş:* {orderNumber}
💰 *Tutar:* {paidAmount} TL
💳 *Yöntem:* {paymentMethod}
```

## 🔌 Integration Points

### Orders Module

**File:** `backend/src/routes/orders.ts`

```typescript
import { sendOrderConfirmationWhatsApp } from '../services/whatsapp.service';

// On order creation
const whatsappResult = await sendOrderConfirmationWhatsApp({
  customerName: order.customer.name,
  customerPhone: order.customer.phone,
  orderNumber: order.orderNumber,
  totalAmount: order.totalAmount,
  pickupDate: formattedPickupDate,
  returnDate: formattedReturnDate,
});
```

### Scheduler Module (Future)

**File:** `backend/src/services/scheduler.ts`

```typescript
import { 
  sendPickupReminderWhatsApp,
  sendReturnReminderWhatsApp,
  sendPaymentReminderWhatsApp 
} from './whatsapp.service';

// Cron job for pickup reminders (daily at 08:00)
cron.schedule('0 8 * * *', async () => {
  // Send pickup reminders for today
});

// Cron job for return reminders (daily at 08:00)
cron.schedule('0 8 * * *', async () => {
  // Send return reminders for today
});
```

## 🐛 Error Handling

### Common Errors

#### 1. Twilio Not Initialized
```
⚠️  Twilio credentials not found. WhatsApp features disabled.
```
**Solution:** Add `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` to `.env`

#### 2. Invalid Phone Number
```
Failed to send WhatsApp message: The 'To' number +90XXXXXXXXXX is not a valid phone number.
```
**Solution:** 
- Check phone number format
- Ensure number is verified in Twilio sandbox
- Use international format: `+905551234567`

#### 3. Sandbox Not Joined
```
Failed to send WhatsApp message: User not opted in to receive messages.
```
**Solution:** 
- Send join code to sandbox number from your WhatsApp
- Wait for confirmation message

#### 4. Message Too Long
```
Failed to send WhatsApp message: Message body exceeds 1600 characters.
```
**Solution:** 
- Shorten message template
- Split into multiple messages

### Error Logging

All errors are logged with Winston:
```typescript
logger.error('❌ Failed to send WhatsApp message:', error);
```

Check logs:
```bash
tail -f backend/logs/error.log
```

## 📊 Phone Number Formatting

The service automatically formats phone numbers:

```typescript
// Input formats accepted:
"905551234567"        → "+905551234567"
"0555 123 45 67"      → "+905551234567"
"+90 555 123 45 67"   → "+905551234567"
"(555) 123-4567"      → "+905551234567"

// Adds whatsapp: prefix automatically
"+905551234567"       → "whatsapp:+905551234567"
```

## 🧪 Testing

### Unit Test Example
```typescript
import { testWhatsAppService } from '../services/whatsapp.service';

describe('WhatsApp Service', () => {
  it('should send test message', async () => {
    const result = await testWhatsAppService('+905551234567');
    expect(result.success).toBe(true);
    expect(result.messageSid).toBeDefined();
  });
});
```

### Integration Test
```bash
# 1. Ensure Twilio is configured
# 2. Join sandbox on your phone
# 3. Run test endpoint
curl -X POST http://localhost:4000/api/test-whatsapp/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+905551234567"}'

# 4. Check your phone for message
```

## 📈 Best Practices

### 1. Rate Limiting
Twilio has rate limits:
- **Sandbox**: ~1 message/second
- **Production**: Higher limits based on plan

Implement queuing for bulk messages:
```typescript
import Queue from 'bull';

const whatsappQueue = new Queue('whatsapp');

whatsappQueue.process(async (job) => {
  await sendWhatsAppMessage(job.data.phone, job.data.message);
});
```

### 2. Message Templates
- Keep messages concise (< 1600 characters)
- Use emojis sparingly
- Include essential info only
- Add call-to-action

### 3. Customer Preferences
Store customer WhatsApp preferences:
```typescript
// Customer model
{
  phone: string,
  whatsappEnabled: boolean,  // Opt-in status
  preferredLanguage: string, // 'tr' or 'en'
}
```

### 4. Logging
Log all WhatsApp operations:
```typescript
logger.info(`✅ WhatsApp sent to ${phone}: ${messageSid}`);
logger.warn(`⚠️  WhatsApp failed: ${error.message}`);
```

## 💰 Pricing

### Twilio WhatsApp Pricing (as of 2025)

**Sandbox (Free):**
- Free for development
- Limited to pre-verified numbers
- 1000 messages/month

**Production:**
- **Business-initiated:** $0.005 - $0.0065 per message
- **User-initiated:** Free (24-hour window)
- **Turkey:** ~$0.006 per message

### Cost Optimization
- Use email for non-urgent notifications
- Batch similar messages
- Leverage 24-hour response window
- Monitor usage via Twilio dashboard

## 🔐 Security

### 1. Credential Protection
```bash
# Never commit credentials
echo "TWILIO_ACCOUNT_SID" >> .gitignore
echo "TWILIO_AUTH_TOKEN" >> .gitignore
```

### 2. API Key Rotation
Rotate Twilio auth tokens quarterly:
1. Generate new token in Twilio Console
2. Update `.env`
3. Restart backend
4. Delete old token

### 3. Phone Number Validation
Always validate before sending:
```typescript
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{10,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}
```

## 📞 Support Contacts

### Twilio Support
- **Email:** help@twilio.com
- **Console:** https://console.twilio.com
- **Docs:** https://www.twilio.com/docs/whatsapp

### Internal Support
- **Backend Team:** backend@canary.com
- **DevOps:** devops@canary.com
- **Slack:** #whatsapp-integration

## 🔄 Migration Plan

### Phase 1: Development (Current)
- ✅ Twilio sandbox setup
- ✅ Basic message templates
- ✅ Order confirmation integration
- ✅ Test endpoints

### Phase 2: Staging
- [ ] Production WhatsApp number approval
- [ ] Message template approval
- [ ] Load testing
- [ ] Customer opt-in flow

### Phase 3: Production
- [ ] Deploy to production
- [ ] Monitor message delivery
- [ ] Gather customer feedback
- [ ] Optimize templates

## 📚 References

- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp/api)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)
- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)
- [Message Template Guidelines](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates)

---

**Last Updated:** January 14, 2025  
**Version:** 1.0.0  
**Status:** ✅ Development Ready (Sandbox)  
**Author:** Canary Equipment Rental System

