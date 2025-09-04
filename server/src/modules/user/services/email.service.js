const nodemailer = require("nodemailer");
const eventEmitter = require("../../../shared/events/eventEmitter");

// Email transporter instance
let transporter = null;

// Initialize email transporter
const initialize = () => {
  try {
    transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error("Email service initialization failed:", error);
      } else {
        console.log("Email service initialized successfully");
      }
    });
  } catch (error) {
    console.error("Failed to initialize email service:", error);
  }
};

// Setup event listeners for different email types
const setupEventListeners = () => {
  // Listen for email sending events
  eventEmitter.subscribe("notification.send_email", async (data) => {
    try {
      await sendEmail(data);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  });
};

// Main email sending function
const sendEmail = async (emailData) => {
  try {
    const { type, to, data } = emailData;

    let emailOptions;

    switch (type) {
      case "welcome":
        emailOptions = getWelcomeEmailOptions(to, data);
        break;
      case "email_verification":
        emailOptions = getVerificationEmailOptions(to, data);
        break;
      case "password_reset":
        emailOptions = getPasswordResetEmailOptions(to, data);
        break;
      case "order_confirmation":
        emailOptions = getOrderConfirmationEmailOptions(to, data);
        break;
      case "order_shipped":
        emailOptions = getOrderShippedEmailOptions(to, data);
        break;
      case "order_delivered":
        emailOptions = getOrderDeliveredEmailOptions(to, data);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const result = await transporter.sendMail(emailOptions);
    console.log(`${type} email sent successfully to ${to}:`, result.messageId);
    return result;
  } catch (error) {
    console.error(`Failed to send ${emailData.type} email:`, error);
    throw error;
  }
};

// Welcome email template
const getWelcomeEmailOptions = (to, data) => {
  const { firstName, lastName } = data;

  return {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject: "Welcome to Our Platform!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Our Platform!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName} ${lastName}!</h2>
            <p>Thank you for joining our platform. We're excited to have you on board!</p>
            <p>Here's what you can do next:</p>
            <ul>
              <li>Complete your profile</li>
              <li>Browse our products</li>
              <li>Add items to your wishlist</li>
              <li>Start shopping!</li>
            </ul>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Happy shopping!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

// Email verification template
const getVerificationEmailOptions = (to, data) => {
  const { firstName, verificationUrl } = data;

  return {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject: "Verify Your Email Address",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

// Password reset template
const getPasswordResetEmailOptions = (to, data) => {
  const { firstName, resetUrl } = data;

  return {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject: "Reset Your Password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>This link will expire in 10 minutes.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

// Order confirmation template
const getOrderConfirmationEmailOptions = (to, data) => {
  const { firstName, orderNumber, orderItems, totalAmount } = data;

  const itemsHtml = orderItems
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price}</td>
    </tr>
  `
    )
    .join("");

  return {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Your order has been confirmed. Here are the details:</p>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <p><strong>Total Amount: ₹${totalAmount}</strong></p>
            <p>We'll send you another email when your order ships.</p>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

// Order shipped template
const getOrderShippedEmailOptions = (to, data) => {
  const { firstName, orderNumber, trackingNumber } = data;

  return {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject: `Order Shipped - ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Shipped!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Great news! Your order has been shipped.</p>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
            <p>You can track your order using the tracking number above.</p>
            <p>Thank you for your patience!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

// Order delivered template
const getOrderDeliveredEmailOptions = (to, data) => {
  const { firstName, orderNumber } = data;

  return {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject: `Order Delivered - ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Delivered</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Delivered!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Your order has been successfully delivered!</p>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p>We hope you're happy with your purchase. If you have any issues, please contact our support team.</p>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

// Initialize the service and setup listeners
const initializeEmailService = () => {
  initialize();
  setupEventListeners();
  console.log("Email service and event listeners initialized");
};

module.exports = {
  initialize,
  setupEventListeners,
  sendEmail,
  getWelcomeEmailOptions,
  getVerificationEmailOptions,
  getPasswordResetEmailOptions,
  getOrderConfirmationEmailOptions,
  getOrderShippedEmailOptions,
  getOrderDeliveredEmailOptions,
  initializeEmailService,
};
