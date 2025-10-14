# 🧪 CANARY - Testing Guide

## 📋 Table of Contents
1. [Manual Testing Checklist](#manual-testing-checklist)
2. [API Testing with Postman](#api-testing-with-postman)
3. [Mobile App Testing](#mobile-app-testing)
4. [Frontend Testing](#frontend-testing)
5. [Integration Testing](#integration-testing)
6. [Performance Testing](#performance-testing)

---

## ✅ Manual Testing Checklist

### Authentication Flow
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Logout
- [ ] Refresh token functionality
- [ ] JWT token expiration handling
- [ ] Protected route access without token (should fail)

### Equipment Management
- [ ] List all equipment
- [ ] Search equipment by name
- [ ] Filter by status (available, in-use, maintenance)
- [ ] Filter by category
- [ ] Create new equipment
- [ ] View equipment details
- [ ] Update equipment
- [ ] Delete equipment
- [ ] Upload equipment image
- [ ] Scan QR code

### Reservation System
- [ ] Create new reservation
- [ ] Add equipment items to reservation
- [ ] Select date range
- [ ] Calculate total price
- [ ] View reservation details
- [ ] Update reservation status
- [ ] Cancel reservation
- [ ] Complete reservation
- [ ] View customer reservations
- [ ] Process payment

### Dashboard & Analytics
- [ ] View dashboard statistics
- [ ] Check revenue metrics
- [ ] Check reservation counts
- [ ] Check equipment status breakdown
- [ ] View recent reservations
- [ ] View upcoming reservations
- [ ] Verify trend indicators

### Notification System
- [ ] Create notification
- [ ] List user notifications
- [ ] Mark notification as read
- [ ] Delete notification
- [ ] Register device token (mobile)
- [ ] Receive push notification
- [ ] View unread count badge
- [ ] Notification banner display

### Security
- [ ] Rate limiting on login (max 5 req/15min)
- [ ] Rate limiting on register (max 3 req/hour)
- [ ] CORS headers present
- [ ] Helmet security headers
- [ ] XSS protection
- [ ] SQL injection protection

---

## 🔧 API Testing with Postman

### Setup

1. **Install Postman**: Download from [postman.com](https://www.postman.com)
2. **Import Collection**: Use the JSON below
3. **Set Environment Variables**:
   - `base_url`: `http://localhost:3000`
   - `token`: (will be set automatically after login)

### Postman Collection JSON

```json
{
  "info": {
    "name": "CANARY API",
    "description": "Complete API testing for CANARY Equipment Rental System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "token",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123456\",\n  \"name\": \"Test User\",\n  \"phone\": \"+905551234567\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/register",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const response = pm.response.json();",
                  "if (response.token) {",
                  "  pm.environment.set('token', response.token);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123456\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "login"]
            }
          }
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/auth/logout",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "logout"]
            }
          }
        }
      ]
    },
    {
      "name": "Dashboard",
      "item": [
        {
          "name": "Get Dashboard Stats",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/dashboard/stats",
              "host": ["{{base_url}}"],
              "path": ["api", "dashboard", "stats"]
            }
          }
        }
      ]
    },
    {
      "name": "Equipment",
      "item": [
        {
          "name": "List Equipment",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/equipment",
              "host": ["{{base_url}}"],
              "path": ["api", "equipment"]
            }
          }
        },
        {
          "name": "Create Equipment",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"MacBook Pro 16\\\"\",\n  \"description\": \"M2 Max, 32GB RAM\",\n  \"category\": \"laptop\",\n  \"status\": \"available\",\n  \"dailyRate\": 500,\n  \"weeklyRate\": 3000,\n  \"monthlyRate\": 10000\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/equipment",
              "host": ["{{base_url}}"],
              "path": ["api", "equipment"]
            }
          }
        },
        {
          "name": "Get Equipment Details",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/equipment/:id",
              "host": ["{{base_url}}"],
              "path": ["api", "equipment", ":id"],
              "variable": [
                {
                  "key": "id",
                  "value": "1"
                }
              ]
            }
          }
        },
        {
          "name": "Update Equipment",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"status\": \"maintenance\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/equipment/:id",
              "host": ["{{base_url}}"],
              "path": ["api", "equipment", ":id"],
              "variable": [
                {
                  "key": "id",
                  "value": "1"
                }
              ]
            }
          }
        },
        {
          "name": "Delete Equipment",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/equipment/:id",
              "host": ["{{base_url}}"],
              "path": ["api", "equipment", ":id"],
              "variable": [
                {
                  "key": "id",
                  "value": "1"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "Reservations",
      "item": [
        {
          "name": "List Reservations",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/reservations",
              "host": ["{{base_url}}"],
              "path": ["api", "reservations"]
            }
          }
        },
        {
          "name": "Create Reservation",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"customerId\": 1,\n  \"startDate\": \"2025-10-15\",\n  \"endDate\": \"2025-10-20\",\n  \"items\": [\n    {\n      \"equipmentId\": 1,\n      \"quantity\": 1,\n      \"dailyRate\": 500\n    }\n  ],\n  \"totalAmount\": 2500,\n  \"deposit\": 500,\n  \"notes\": \"Customer requires delivery\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reservations",
              "host": ["{{base_url}}"],
              "path": ["api", "reservations"]
            }
          }
        }
      ]
    },
    {
      "name": "Notifications",
      "item": [
        {
          "name": "List Notifications",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/notifications",
              "host": ["{{base_url}}"],
              "path": ["api", "notifications"]
            }
          }
        },
        {
          "name": "Mark as Read",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/notifications/:id/read",
              "host": ["{{base_url}}"],
              "path": ["api", "notifications", ":id", "read"],
              "variable": [
                {
                  "key": "id",
                  "value": "1"
                }
              ]
            }
          }
        },
        {
          "name": "Register Device Token",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"token\": \"ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]\",\n  \"platform\": \"ios\",\n  \"deviceId\": \"unique-device-id-123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/notifications/register",
              "host": ["{{base_url}}"],
              "path": ["api", "notifications", "register"]
            }
          }
        }
      ]
    },
    {
      "name": "Customers",
      "item": [
        {
          "name": "List Customers",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/customers",
              "host": ["{{base_url}}"],
              "path": ["api", "customers"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## 📱 Mobile App Testing

### Installation & Setup
```bash
cd mobile
npm install
npx expo start
```

### Test Scenarios

#### 1. Login Flow
1. Open app
2. Enter valid credentials
3. Verify navigation to Home screen
4. Verify token stored in AsyncStorage

#### 2. Equipment Module
1. Navigate to Equipment screen
2. Verify list loads
3. Pull to refresh
4. Search for equipment
5. Apply filters
6. Open equipment details
7. Verify QR code display

#### 3. Offline Mode
1. Disable internet connection
2. Try to create/update data
3. Verify queued in sync store
4. Enable internet
5. Verify automatic sync

#### 4. Push Notifications
1. Login to app
2. Grant notification permissions
3. Verify device token registered
4. Send test notification from backend
5. Verify notification received
6. Tap notification
7. Verify navigation

#### 5. Settings Screen
1. Navigate to Profile > Settings
2. Toggle theme
3. Toggle notifications
4. Change language
5. Verify biometric option (if available)
6. Clear cache
7. Logout

### Performance Tests
- [ ] List scrolling (60fps)
- [ ] Image loading speed
- [ ] API response time
- [ ] App launch time
- [ ] Memory usage
- [ ] Battery consumption

---

## 🌐 Frontend Testing

### Setup
```bash
cd frontend
npm install
npm run dev
```

### Test Scenarios

#### 1. Dashboard
1. Login
2. Verify dashboard loads
3. Check KPI cards (revenue, reservations, equipment)
4. Verify trend indicators
5. Check recent reservations list
6. Check upcoming reservations table
7. Verify refresh button

#### 2. Equipment Management
1. Navigate to Inventory/Tools page
2. Click "New Equipment"
3. Fill form and submit
4. Verify success toast
5. Edit equipment
6. Delete equipment
7. Verify confirmation modal

#### 3. Notification System
1. Click bell icon
2. Verify notification panel opens
3. Check unread count badge
4. Mark notification as read
5. Delete notification
6. Verify banner for urgent notifications

#### 4. Responsive Design
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1920px)
- [ ] Verify sidebar collapse
- [ ] Check touch targets

---

## 🔗 Integration Testing

### End-to-End Scenarios

#### Scenario 1: Complete Reservation Flow
1. **Frontend**: Login as customer
2. **Frontend**: Browse available equipment
3. **Frontend**: Select equipment and date range
4. **Backend**: Calculate total price
5. **Frontend**: Submit reservation
6. **Backend**: Create reservation record
7. **Backend**: Update equipment status
8. **Backend**: Send confirmation notification
9. **Mobile**: Receive push notification
10. **Mobile**: View reservation details

#### Scenario 2: Equipment Maintenance
1. **Mobile**: Mark equipment as maintenance
2. **Backend**: Update status
3. **Backend**: Create notification
4. **Frontend**: Dashboard shows updated count
5. **Frontend**: Equipment list filters correctly

#### Scenario 3: Real-time Updates
1. **Frontend**: User A creates equipment
2. **Backend**: Broadcasts update
3. **Mobile**: User B receives notification
4. **Mobile**: Equipment list refreshes
5. **Frontend**: User C sees updated dashboard

### Cross-Platform Tests
- [ ] Mobile → Backend → Web sync
- [ ] Web → Backend → Mobile sync
- [ ] Notification delivery across platforms
- [ ] Session management (login, logout)
- [ ] File upload from web/mobile

---

## ⚡ Performance Testing

### Load Testing

#### Tools
- Apache Bench (ab)
- Artillery
- k6

#### Test Commands

**Login Endpoint**
```bash
ab -n 1000 -c 10 -p login.json -T application/json http://localhost:3000/api/auth/login
```

**Equipment List**
```bash
ab -n 1000 -c 50 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/equipment
```

#### Performance Targets
- Response time < 200ms (average)
- Throughput > 100 req/s
- Error rate < 1%
- CPU usage < 70%
- Memory usage < 1GB

### Database Performance
```sql
-- Check slow queries
EXPLAIN QUERY PLAN SELECT * FROM Equipment WHERE status = 'available';

-- Verify indexes
SELECT * FROM sqlite_master WHERE type = 'index';
```

### Frontend Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size < 500KB

---

## 🐛 Bug Tracking Template

```markdown
### Bug Report

**Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Environment**:
- Platform: Web / Mobile / Backend
- OS: Windows / macOS / iOS / Android
- Version: 1.0.0

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots/Logs**:
[Attach if applicable]

**Possible Fix**:
[Optional suggestions]
```

---

## ✅ Test Coverage Report

### Backend
- [ ] Auth routes (100%)
- [ ] Equipment routes (100%)
- [ ] Reservation routes (100%)
- [ ] Notification routes (100%)
- [ ] Dashboard routes (100%)
- [ ] Error handling (100%)

### Frontend
- [ ] Login/Register pages (100%)
- [ ] Dashboard (100%)
- [ ] Equipment pages (100%)
- [ ] Notification system (100%)
- [ ] Components (80%)

### Mobile
- [ ] Authentication (100%)
- [ ] Equipment module (100%)
- [ ] Offline mode (100%)
- [ ] Push notifications (100%)
- [ ] Settings (100%)

---

## 🎯 Testing Completion Checklist

- [ ] All manual tests passed
- [ ] Postman collection created and tested
- [ ] Mobile app tested on iOS
- [ ] Mobile app tested on Android
- [ ] Frontend tested on Chrome/Safari/Firefox
- [ ] Integration tests passed
- [ ] Performance tests completed
- [ ] Security audit passed
- [ ] No critical bugs remaining
- [ ] Documentation updated

---

## 📊 Test Results Summary

```
Total Tests: 150+
Passed: ____ 
Failed: ____
Skipped: ____
Coverage: ____%

Platform Breakdown:
- Backend: ____%
- Frontend: ____%
- Mobile: ____%

Status: ⏳ In Progress / ✅ Complete / ❌ Failed
```

---

## 🚀 Next Steps After Testing

1. Fix identified bugs
2. Optimize performance bottlenecks
3. Update documentation
4. Deploy to staging
5. User acceptance testing
6. Deploy to production

---

**Last Updated**: October 13, 2025
**Status**: Ready for Testing 🧪
