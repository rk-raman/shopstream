const { connectDB } = require("./database");

// Email Configuration
const email = {
  service: process.env.EMAIL_SERVICE || "gmail",
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true",
  apiKey: process.env.EMAIL_API_KEY,
};

// SMS Configuration
const sms = {
  provider: process.env.SMS_PROVIDER || "disabled",
  accountSid: process.env.SMS_ACCOUNT_SID,
  authToken: process.env.SMS_AUTH_TOKEN,
  fromNumber: process.env.SMS_FROM_NUMBER,
  defaultCountryCode: process.env.SMS_DEFAULT_COUNTRY_CODE || "91",
};

// Push Configuration
const push = {
  firebase: {
    enabled: process.env.PUSH_FIREBASE_ENABLED === "true",
    serviceAccount: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    },
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  },
  webpush: {
    enabled: process.env.PUSH_WEBPUSH_ENABLED === "true",
    subject: process.env.WEBPUSH_SUBJECT || "mailto:admin@shopstream.com",
    publicKey: process.env.WEBPUSH_PUBLIC_KEY,
    privateKey: process.env.WEBPUSH_PRIVATE_KEY,
  },
};

module.exports = {
  connectDB,
  email,
  sms,
  push,
};
