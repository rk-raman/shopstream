# Notification Service Setup Guide

Step-by-step guide to configure Email, SMS, Push, and WhatsApp notifications for ShopStream.

---

## Prerequisites

- Node.js 16+
- Redis running locally or a cloud Redis URL
- MongoDB connected
- ShopStream server running

---

## 1. Redis (Required — powers all queues)

Bull queues require Redis. All notification channels go through Redis queues.

### Local Redis

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Verify
redis-cli ping   # Should return PONG
```

### Cloud Redis (Upstash / Redis Cloud / AWS ElastiCache)

Get a Redis URL from your provider.

### Add to `.env`

```env
REDIS_URL=redis://localhost:6379
```

For cloud Redis with auth:

```env
REDIS_URL=redis://default:your-password@your-host.upstash.io:6379
```

### Verify

Start the server and check logs for:

```
✅ Redis Connected and ready
```

---

## 2. Email Service

Four providers supported. Choose one.

### Option A: Gmail (Development / Low Volume)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate an app password for "Mail"
5. Copy the 16-character password

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM="ShopStream <your-email@gmail.com>"
```

> Gmail limits: 500 emails/day for personal, 2000/day for Workspace.

### Option B: SendGrid (Production)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Go to Settings → API Keys → Create API Key (Full Access)
3. Verify a sender identity (Settings → Sender Authentication)

```env
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="ShopStream <noreply@yourdomain.com>"
```

**Enable delivery webhooks:**

1. Go to Settings → Mail Settings → Event Webhook
2. Set HTTP POST URL: `https://your-domain.com/api/webhooks/sendgrid/email`
3. Select events: Delivered, Opened, Clicked, Bounced, Dropped, Spam Reports
4. Enable

### Option C: Mailgun (Production)

1. Sign up at [mailgun.com](https://www.mailgun.com)
2. Add and verify your domain
3. Get API key from Settings → API Keys

```env
EMAIL_SERVICE=mailgun
EMAIL_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="ShopStream <noreply@mg.yourdomain.com>"
```

### Option D: Custom SMTP

```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
EMAIL_FROM="ShopStream <noreply@yourdomain.com>"
```

### Verify Email

Restart server. Check logs for:

```
Email service initialized successfully
```

Test by triggering a user registration — you should receive a welcome email.

---

## 3. SMS Service (Twilio)

### Setup

1. Sign up at [twilio.com](https://www.twilio.com)
2. From the Console dashboard, copy:
   - Account SID
   - Auth Token
3. Go to Phone Numbers → Buy a Number (or use the trial number)

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+1234567890
SMS_DEFAULT_COUNTRY_CODE=+91
```

> Trial accounts: can only send to verified numbers. Upgrade for production.

### Enable delivery webhooks

1. Go to Phone Numbers → Active Numbers → Select your number
2. Under Messaging → "A MESSAGE COMES IN", set webhook to:
   `https://your-domain.com/api/webhooks/twilio/sms`
3. Set HTTP method to POST

For status callbacks, the queue processor passes the webhook URL automatically when configured.

### Verify SMS

Restart server. Check logs for:

```
SMS service initialized (twilio)
```

If credentials are missing, you'll see:

```
SMS service initialized in mock mode (disabled)
```

Mock mode logs SMS to console instead of sending.

---

## 4. Push Notifications

Two providers work simultaneously: Firebase (mobile + web) and Web Push (browser-only).

### 4A: Firebase Cloud Messaging (FCM)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project (or select existing)
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key" — downloads a JSON file
5. Save it as `firebase-service-account.json` in the server root

```env
PUSH_FIREBASE_ENABLED=true
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 4B: Web Push (VAPID)

Generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

Output:

```
Public Key:  BNxxxxxxxxxxxxxxxxxxxxxxx
Private Key: xxxxxxxxxxxxxxxxxxxxxxx
```

```env
PUSH_WEBPUSH_ENABLED=true
VAPID_SUBJECT=mailto:admin@shopstream.com
VAPID_PUBLIC_KEY=BNxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxx
```

### Frontend Integration (Web Push)

In your frontend, subscribe the browser to push:

```javascript
// Request permission
const permission = await Notification.requestPermission();
if (permission !== 'granted') return;

// Register service worker
const registration = await navigator.serviceWorker.register('/sw.js');

// Subscribe
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
});

// Send subscription to backend
await fetch('/api/notifications/device-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    type: 'webpush',
    subscription: subscription,
    deviceInfo: { browser: navigator.userAgent }
  })
});
```

### Verify Push

Restart server. No specific log — push sends will log results in the queue worker output.

---

## 5. WhatsApp

Two providers. Choose one.

### Option A: Meta Cloud API (Production)

This is the official WhatsApp Business API.

**Prerequisites:**
- Meta Business Account
- WhatsApp Business Account

**Setup:**

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create an App → Select "Business" type
3. Add "WhatsApp" product
4. In WhatsApp → Getting Started:
   - Copy **Phone Number ID**
   - Copy **Temporary Access Token** (or create permanent token)
5. For webhook, go to WhatsApp → Configuration:
   - Callback URL: `https://your-domain.com/api/webhooks/whatsapp`
   - Verify Token: choose any secret string
   - Subscribe to: `messages`, `message_deliveries`

```env
WHATSAPP_PROVIDER=meta
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAABxxxxxxxxxxxxxxxx
WHATSAPP_VERIFY_TOKEN=my-secret-verify-token
WHATSAPP_API_VERSION=v18.0
```

**Important:** Meta requires pre-approved message templates to initiate conversations. Free-form messages only work within the 24-hour reply window.

**Create message templates:**
1. Go to WhatsApp Manager → Message Templates
2. Create templates for: order_confirmation, shipping_update, delivery_confirmation, otp
3. Submit for approval (usually takes 1-24 hours)

### Option B: Twilio WhatsApp (Development / Quick Start)

Twilio offers a WhatsApp sandbox for testing.

1. In Twilio Console → Messaging → Try it Out → Send a WhatsApp message
2. Follow the sandbox setup instructions (send a code to the sandbox number)
3. Copy the sandbox number

```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxx       # same as SMS
TWILIO_AUTH_TOKEN=xxxxxxxx           # same as SMS
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

> Sandbox limitations: recipients must opt-in by sending a code first. For production, apply for a Twilio WhatsApp Business Profile.

### Verify WhatsApp

Restart server. Check logs for:

```
WhatsApp service initialized (meta)
```

or:

```
WhatsApp service initialized in mock mode (disabled)
```

---

## 6. Minimal Setup (Development)

For local development, you only need Redis and Gmail. Everything else falls back to mock mode.

```env
# Required
REDIS_URL=redis://localhost:6379

# Email (minimum to send real emails)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="ShopStream <your-email@gmail.com>"

# Client URL (for email links)
CLIENT_URL=http://localhost:3000
```

All other channels (SMS, Push, WhatsApp) will run in mock mode — they log to console instead of sending.

---

## 7. Full Production Setup

```env
# ─── Redis ───
REDIS_URL=redis://default:password@redis-host:6379

# ─── Email (SendGrid) ───
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="ShopStream <noreply@shopstream.com>"

# ─── SMS (Twilio) ───
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+1234567890
SMS_DEFAULT_COUNTRY_CODE=+91

# ─── Push (Firebase + Web Push) ───
PUSH_FIREBASE_ENABLED=true
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
PUSH_WEBPUSH_ENABLED=true
VAPID_SUBJECT=mailto:admin@shopstream.com
VAPID_PUBLIC_KEY=BNxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxx

# ─── WhatsApp (Meta) ───
WHATSAPP_PROVIDER=meta
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAABxxxxxxxxxxxxxxxx
WHATSAPP_VERIFY_TOKEN=my-secret-verify-token

# ─── Client ───
CLIENT_URL=https://shopstream.com
```

---

## 8. Webhook URLs to Configure

Once your server is deployed to a public URL, configure these webhook URLs in each provider's dashboard:

| Provider | Dashboard Location | Webhook URL |
|----------|-------------------|-------------|
| SendGrid | Settings → Mail Settings → Event Webhook | `https://your-domain.com/api/webhooks/sendgrid/email` |
| Twilio | Phone Numbers → Your Number → Messaging | `https://your-domain.com/api/webhooks/twilio/sms` |
| Meta WhatsApp | App Dashboard → WhatsApp → Configuration | `https://your-domain.com/api/webhooks/whatsapp` |

For local development, use [ngrok](https://ngrok.com) to expose your localhost:

```bash
ngrok http 5000
# Use the https URL for webhooks, e.g.: https://abc123.ngrok.io/api/webhooks/twilio/sms
```

---

## 9. Testing

### Test Email

```bash
# Trigger via user registration (or any event)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"Test1234!","role":"customer"}'

# Check server logs for:
# [Queue:emailQueue] Job 1 completed test@example.com
```

### Test SMS (mock mode)

```bash
# Server logs will show:
# [SMS:Mock] To: +919876543210 | Message: Welcome to ShopStream...
```

### Test WhatsApp (mock mode)

```bash
# Server logs will show:
# [WhatsApp:Mock] To: +919876543210 | Message: *Order Confirmed!*...
```

### Test Queue Health

```bash
# Check queue stats
curl http://localhost:5000/api/health
```

### View Notifications in DB

```bash
# Via MongoDB shell or Compass
db.notifications.find({ recipient: ObjectId("user-id") }).sort({ createdAt: -1 })
```

---

## 10. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `SMS service initialized in mock mode` | No Twilio credentials | Add `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` to `.env` |
| `WhatsApp service initialized in mock mode` | No WhatsApp credentials | Add `WHATSAPP_ACCESS_TOKEN` or configure Twilio |
| Email not sending | Wrong app password | Regenerate Gmail app password; ensure 2FA is on |
| `Redis connection error` | Redis not running | Start Redis: `brew services start redis` or `sudo systemctl start redis` |
| Queue jobs stuck in `waiting` | Workers not processing | Check if Redis is connected; restart server |
| Webhook returns 404 | Wrong URL path | Ensure path is `/api/webhooks/...` not `/webhooks/...` |
| SendGrid bounces | Unverified sender | Verify sender identity in SendGrid dashboard |
| Twilio `21608` error | Unverified number (trial) | Verify recipient number in Twilio console or upgrade account |
| Meta WhatsApp `131030` | Template not approved | Submit template for approval in WhatsApp Manager |
| Push not received | No device tokens registered | Frontend must register service worker and send subscription to backend |

---

## 11. Channel Behavior Summary

| Channel | When Disabled | When Enabled but Fails | Retry |
|---------|--------------|----------------------|-------|
| Email | Skipped silently | Logs error, retries 3x | Exponential: 5s → 10s → 20s |
| SMS | Mock: logs to console | Logs error, retries 3x | Exponential: 5s → 10s → 20s |
| Push | Skipped if no device tokens | Logs error, retries 3x | Exponential: 5s → 10s → 20s |
| WhatsApp | Mock: logs to console | Logs error, retries 2x | Exponential: 5s → 10s |
| In-App | Always delivered | N/A (local DB write) | No retry needed |
