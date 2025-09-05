/**
 * Email Service Test Script
 *
 * This script tests the email service configuration
 * Run with: node test-email.js
 */

require("dotenv").config();
const emailService = require("./src/modules/notification/services/email.service");

async function testEmailService() {
  console.log("🧪 Testing Email Service Configuration...\n");

  try {
    // Test 1: Check environment variables
    console.log("📋 Environment Variables:");
    console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || "NOT SET"}`);
    console.log(`EMAIL_USER: ${process.env.EMAIL_USER || "NOT SET"}`);
    console.log(
      `EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? "***SET***" : "NOT SET"}`
    );
    console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || "NOT SET"}\n`);

    // Test 2: Send a test email
    console.log("📧 Sending Test Email...");

    const testEmail = {
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: "ShopStream Email Test",
      html: `
        <h1>🎉 Email Service Test Successful!</h1>
        <p>This is a test email from your ShopStream notification system.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Service:</strong> ${process.env.EMAIL_SERVICE}</p>
        <hr>
        <p><em>If you received this email, your notification system is working correctly!</em></p>
      `,
      text: "ShopStream Email Test - Your notification system is working correctly!",
    };

    const result = await emailService.sendEmail(testEmail);

    console.log("✅ Email sent successfully!");
    console.log("📊 Result:", {
      success: result.success,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
    });
  } catch (error) {
    console.error("❌ Email test failed:", error.message);

    if (error.message.includes("Invalid login")) {
      console.log("\n💡 Troubleshooting Tips:");
      console.log(
        "1. Make sure you're using an App Password, not your regular Gmail password"
      );
      console.log("2. Enable 2-Factor Authentication on your Google account");
      console.log(
        "3. Generate a new App Password: https://myaccount.google.com/apppasswords"
      );
    } else if (error.message.includes("Missing required email fields")) {
      console.log("\n💡 Troubleshooting Tips:");
      console.log(
        "1. Check your .env file has EMAIL_USER and EMAIL_PASSWORD set"
      );
      console.log("2. Make sure EMAIL_USER is your full Gmail address");
    }
  }
}

// Run the test
testEmailService()
  .then(() => {
    console.log("\n🏁 Email test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test script failed:", error);
    process.exit(1);
  });
