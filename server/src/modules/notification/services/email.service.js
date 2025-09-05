const nodemailer = require("nodemailer");
const ApiError = require("../../../shared/utils/apiError");
const { email: emailConfig } = require("../../../config");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Create transporter based on configuration
      if (emailConfig.service === "gmail") {
        this.transporter = nodemailer.createTransporter({
          service: "gmail",
          auth: {
            user: emailConfig.user,
            pass: emailConfig.password,
          },
        });
      } else if (emailConfig.service === "smtp") {
        this.transporter = nodemailer.createTransporter({
          host: emailConfig.host,
          port: emailConfig.port,
          secure: emailConfig.secure,
          auth: {
            user: emailConfig.user,
            pass: emailConfig.password,
          },
        });
      } else if (emailConfig.service === "sendgrid") {
        this.transporter = nodemailer.createTransporter({
          service: "SendGrid",
          auth: {
            user: "apikey",
            pass: emailConfig.apiKey,
          },
        });
      } else if (emailConfig.service === "mailgun") {
        this.transporter = nodemailer.createTransporter({
          service: "Mailgun",
          auth: {
            user: emailConfig.user,
            pass: emailConfig.password,
          },
        });
      }

      // Verify connection
      if (this.transporter) {
        await this.transporter.verify();
        console.log("Email service initialized successfully");
      }
    } catch (error) {
      console.error("Failed to initialize email service:", error);
      throw new ApiError(500, "Email service initialization failed");
    }
  }

  async sendEmail(emailData) {
    try {
      if (!this.transporter) {
        throw new ApiError(500, "Email service not initialized");
      }

      const {
        to,
        subject,
        html,
        text,
        from,
        replyTo,
        cc,
        bcc,
        attachments,
        headers,
        priority = "normal",
      } = emailData;

      // Validate required fields
      if (!to || !subject || (!html && !text)) {
        throw new ApiError(400, "Missing required email fields");
      }

      // Prepare email options
      const mailOptions = {
        from: from || emailConfig.from || emailConfig.user,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        html,
        text,
        priority: this.getPriorityValue(priority),
      };

      // Add optional fields
      if (replyTo) mailOptions.replyTo = replyTo;
      if (cc) mailOptions.cc = Array.isArray(cc) ? cc.join(", ") : cc;
      if (bcc) mailOptions.bcc = Array.isArray(bcc) ? bcc.join(", ") : bcc;
      if (attachments) mailOptions.attachments = attachments;
      if (headers) mailOptions.headers = headers;

      // Send email
      const result = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
        response: result.response,
        accepted: result.accepted,
        rejected: result.rejected,
      };
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new ApiError(500, `Email sending failed: ${error.message}`);
    }
  }

  async sendBulkEmails(emailsData) {
    try {
      const results = await Promise.allSettled(
        emailsData.map((emailData) => this.sendEmail(emailData))
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled"
      );
      const failed = results.filter((result) => result.status === "rejected");

      return {
        total: emailsData.length,
        successful: successful.length,
        failed: failed.length,
        results: results.map((result, index) => ({
          index,
          success: result.status === "fulfilled",
          data: result.status === "fulfilled" ? result.value : null,
          error: result.status === "rejected" ? result.reason.message : null,
        })),
      };
    } catch (error) {
      throw new ApiError(500, `Bulk email sending failed: ${error.message}`);
    }
  }

  async sendTemplateEmail(templateName, templateData, emailData) {
    try {
      // This would integrate with a template engine like Handlebars, EJS, etc.
      // For now, we'll use simple string replacement
      const template = await this.getEmailTemplate(templateName);

      if (!template) {
        throw new ApiError(404, `Email template '${templateName}' not found`);
      }

      // Render template with data
      const renderedSubject = this.renderTemplate(
        template.subject,
        templateData
      );
      const renderedHtml = this.renderTemplate(template.html, templateData);
      const renderedText = this.renderTemplate(template.text, templateData);

      return await this.sendEmail({
        ...emailData,
        subject: renderedSubject,
        html: renderedHtml,
        text: renderedText,
      });
    } catch (error) {
      throw new ApiError(
        500,
        `Template email sending failed: ${error.message}`
      );
    }
  }

  async getEmailTemplate(templateName) {
    // This would typically fetch from a database or file system
    // For now, return a mock template
    const templates = {
      welcome: {
        subject: "Welcome to {{appName}}!",
        html: `
          <h1>Welcome {{firstName}}!</h1>
          <p>Thank you for joining {{appName}}. We're excited to have you on board!</p>
          <p>Your account has been created successfully.</p>
          <a href="{{verificationLink}}">Verify your email</a>
        `,
        text: "Welcome {{firstName}}! Thank you for joining {{appName}}.",
      },
      orderConfirmation: {
        subject: "Order Confirmation - {{orderNumber}}",
        html: `
          <h1>Order Confirmed!</h1>
          <p>Hi {{firstName}},</p>
          <p>Your order #{{orderNumber}} has been confirmed.</p>
          <p>Total Amount: {{totalAmount}}</p>
          <a href="{{orderLink}}">View Order Details</a>
        `,
        text: "Order Confirmed! Your order #{{orderNumber}} has been confirmed.",
      },
      passwordReset: {
        subject: "Password Reset Request",
        html: `
          <h1>Password Reset</h1>
          <p>Hi {{firstName}},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="{{resetLink}}">Reset Password</a>
          <p>This link will expire in {{expiryTime}}.</p>
        `,
        text: "Password Reset Request. Click {{resetLink}} to reset your password.",
      },
    };

    return templates[templateName] || null;
  }

  renderTemplate(template, data) {
    if (!template || !data) return template;

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  getPriorityValue(priority) {
    const priorityMap = {
      low: "5",
      normal: "3",
      high: "1",
      urgent: "1",
    };
    return priorityMap[priority] || "3";
  }

  async validateEmailAddress(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async validateEmailList(emails) {
    const emailList = Array.isArray(emails) ? emails : [emails];
    const validEmails = [];
    const invalidEmails = [];

    for (const email of emailList) {
      if (await this.validateEmailAddress(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    }

    return {
      valid: validEmails,
      invalid: invalidEmails,
      allValid: invalidEmails.length === 0,
    };
  }

  async getDeliveryStatus(messageId) {
    // This would typically integrate with the email service provider's API
    // to check delivery status
    return {
      messageId,
      status: "delivered", // or "pending", "failed", "bounced"
      timestamp: new Date(),
    };
  }

  async getEmailStats(timeRange = "7d") {
    // This would typically fetch from the email service provider's analytics
    return {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
      timeRange,
    };
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
