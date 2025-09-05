# 📧 Email Service Setup Guide

This guide will help you set up a **free email service** for your ShopStream notification system.

## 🆓 Free Email Service Options

### **Option 1: Gmail (Recommended for Testing)**

- ✅ **Free**: Up to 100 emails/day
- ✅ **Easy setup**: Just use your Gmail credentials
- ✅ **Reliable**: Google's infrastructure
- ✅ **Perfect for development**

### **Option 2: Mailtrap (Best for Development)**

- ✅ **Free**: 100 emails/month
- ✅ **Perfect for testing**: Catches emails without sending them
- ✅ **No spam**: Safe for development
- ✅ **Email preview**: See how emails look

### **Option 3: SendGrid (Free Tier)**

- ✅ **Free**: 100 emails/day forever
- ✅ **Professional**: Good for production later
- ✅ **Easy API**: Simple integration

---

## 🚀 Quick Setup with Gmail

### **Step 1: Create .env File**

Create a `.env` file in your `server` directory:

```bash
# ===========================================
# EMAIL CONFIGURATION (FREE GMAIL SETUP)
# ===========================================

# Email Service Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@shopstream.com

# ===========================================
# OTHER CONFIGURATION
# ===========================================

# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/shopstream

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=shopstream
JWT_AUDIENCE=shopstream-users

# SMS Configuration (Disabled for now)
SMS_PROVIDER=disabled

# Push Configuration (Disabled for now)
PUSH_FIREBASE_ENABLED=false
PUSH_WEBPUSH_ENABLED=false

# Event System Configuration
EVENT_BUS_TYPE=eventemitter
EVENT_DEBUG=true

# Debug Configuration
DEBUG=notification:*
```

### **Step 2: Setup Gmail App Password**

1. **Go to your Google Account**: https://myaccount.google.com/
2. **Enable 2-Factor Authentication** (required for app passwords):
   - Go to Security → 2-Step Verification
   - Follow the setup process
3. **Generate App Password**:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (custom name)"
   - Enter "ShopStream" as the name
   - Copy the generated 16-character password (like: `abcd efgh ijkl mnop`)

### **Step 3: Update .env File**

Replace the placeholder values in your `.env` file:

```bash
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Important**:

- Use your **full Gmail address** (e.g., `john.doe@gmail.com`)
- Use the **16-character app password**, not your regular Gmail password
- Remove spaces from the app password if any

### **Step 4: Test Email Configuration**

Run the email test script:

```bash
cd server
node test-email.js
```

You should see:

```
🧪 Testing Email Service Configuration...

📋 Environment Variables:
EMAIL_SERVICE: gmail
EMAIL_USER: your-gmail@gmail.com
EMAIL_PASSWORD: ***SET***
EMAIL_FROM: noreply@shopstream.com

📧 Sending Test Email...
✅ Email sent successfully!
📊 Result: { success: true, messageId: '...', accepted: [...], rejected: [] }

🏁 Email test completed!
```

### **Step 5: Test User Registration**

1. **Start your server**:

   ```bash
   npm run dev
   ```

2. **Register a new user** through your API or frontend

3. **Check the user's email** - they should receive:
   - **Welcome email** immediately
   - **Email verification reminder** after 5 minutes

---

## 🔧 Alternative Email Services

### **Mailtrap Setup (For Development)**

1. **Sign up**: https://mailtrap.io/
2. **Get credentials** from your inbox
3. **Update .env**:
   ```bash
   EMAIL_SERVICE=smtp
   EMAIL_HOST=sandbox.smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your-mailtrap-username
   EMAIL_PASSWORD=your-mailtrap-password
   EMAIL_SECURE=false
   ```

### **SendGrid Setup (For Production)**

1. **Sign up**: https://sendgrid.com/
2. **Get API key** from Settings → API Keys
3. **Update .env**:
   ```bash
   EMAIL_SERVICE=sendgrid
   EMAIL_API_KEY=your-sendgrid-api-key
   EMAIL_FROM=verified-sender@yourdomain.com
   ```

---

## 🐛 Troubleshooting

### **Common Issues:**

#### **"Invalid login" Error**

- ✅ Make sure you're using an **App Password**, not your regular Gmail password
- ✅ Enable **2-Factor Authentication** on your Google account
- ✅ Generate a new App Password: https://myaccount.google.com/apppasswords

#### **"Missing required email fields" Error**

- ✅ Check your `.env` file has `EMAIL_USER` and `EMAIL_PASSWORD` set
- ✅ Make sure `EMAIL_USER` is your full Gmail address
- ✅ Restart your server after updating `.env`

#### **"Email service not initialized" Error**

- ✅ Check your email credentials are correct
- ✅ Verify your internet connection
- ✅ Check server logs for detailed error messages

#### **Emails Not Sending**

- ✅ Check your Gmail daily sending limit (100 emails/day)
- ✅ Verify the recipient email address is valid
- ✅ Check spam folder
- ✅ Ensure your server is running and connected to the internet

### **Debug Mode**

Enable debug logging by setting in your `.env`:

```bash
DEBUG=notification:*
```

This will show detailed logs of the email sending process.

---

## 📊 What Happens When User Registers?

When a user registers, the notification system automatically:

1. **Sends Welcome Email** (immediate):

   - Subject: "Welcome to ShopStream!"
   - Message: "Hi [FirstName], welcome to ShopStream! Your account has been created successfully."
   - Action: "Complete Profile" button

2. **Schedules Email Verification Reminder** (5 minutes later):

   - Subject: "Verify Your Email"
   - Message: "Please verify your email address to secure your account."
   - Action: "Verify Email" button

3. **Tracks Analytics**:
   - Email delivery status
   - User engagement (opens, clicks)
   - Failed delivery attempts

---

## 🚀 Next Steps

Once email is working:

1. **Test with real user registration**
2. **Monitor email delivery rates**
3. **Set up SMS service** (when ready)
4. **Configure push notifications** (when ready)
5. **Add WhatsApp integration** (when ready)

---

## 📞 Support

If you encounter issues:

1. **Check the logs** in your server console
2. **Run the test script**: `node test-email.js`
3. **Verify your .env configuration**
4. **Test with a different email service** (Mailtrap for development)

The notification system is designed to be robust and will gracefully handle email failures while continuing to work with other channels.
