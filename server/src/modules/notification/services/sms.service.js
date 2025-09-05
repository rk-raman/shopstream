const twilio = require("twilio");
const ApiError = require("../../../shared/utils/apiError");
const config = require("../../../config");

class SMSService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  async initializeClient() {
    try {
      if (config.sms.provider === "twilio") {
        this.client = twilio(config.sms.accountSid, config.sms.authToken);
        console.log("SMS service (Twilio) initialized successfully");
      } else if (config.sms.provider === "aws-sns") {
        // AWS SNS implementation would go here
        console.log("SMS service (AWS SNS) initialized successfully");
      } else if (config.sms.provider === "textlocal") {
        // TextLocal implementation would go here
        console.log("SMS service (TextLocal) initialized successfully");
      } else {
        console.log("SMS service initialized in mock mode");
      }
    } catch (error) {
      console.error("Failed to initialize SMS service:", error);
      throw new ApiError(500, "SMS service initialization failed");
    }
  }

  async sendSMS(smsData) {
    try {
      const {
        to,
        message,
        from,
        mediaUrl,
        statusCallback,
        maxPrice,
        provideFeedback = false,
      } = smsData;

      // Validate required fields
      if (!to || !message) {
        throw new ApiError(400, "Missing required SMS fields: to and message");
      }

      // Validate phone number format
      const phoneValidation = await this.validatePhoneNumber(to);
      if (!phoneValidation.isValid) {
        throw new ApiError(
          400,
          `Invalid phone number: ${phoneValidation.error}`
        );
      }

      // Format phone number
      const formattedTo = this.formatPhoneNumber(to);

      let result;

      if (config.sms.provider === "twilio" && this.client) {
        // Send via Twilio
        const messageOptions = {
          body: message,
          from: from || config.sms.fromNumber,
          to: formattedTo,
          provideFeedback,
        };

        if (mediaUrl) messageOptions.mediaUrl = mediaUrl;
        if (statusCallback) messageOptions.statusCallback = statusCallback;
        if (maxPrice) messageOptions.maxPrice = maxPrice;

        result = await this.client.messages.create(messageOptions);
      } else {
        // Mock SMS sending for development/testing
        result = await this.mockSendSMS({
          to: formattedTo,
          message,
          from: from || config.sms.fromNumber,
        });
      }

      return {
        success: true,
        messageId: result.sid || result.messageId,
        status: result.status || "sent",
        to: formattedTo,
        from: result.from || from || config.sms.fromNumber,
        body: message,
        price: result.price,
        priceUnit: result.priceUnit,
      };
    } catch (error) {
      console.error("SMS sending failed:", error);
      throw new ApiError(500, `SMS sending failed: ${error.message}`);
    }
  }

  async sendBulkSMS(smsDataArray) {
    try {
      const results = await Promise.allSettled(
        smsDataArray.map((smsData) => this.sendSMS(smsData))
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled"
      );
      const failed = results.filter((result) => result.status === "rejected");

      return {
        total: smsDataArray.length,
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
      throw new ApiError(500, `Bulk SMS sending failed: ${error.message}`);
    }
  }

  async sendOTP(phoneNumber, otp, expiryMinutes = 5) {
    try {
      const message = `Your OTP is ${otp}. Valid for ${expiryMinutes} minutes. Do not share this with anyone.`;

      return await this.sendSMS({
        to: phoneNumber,
        message,
        from: config.sms.fromNumber,
      });
    } catch (error) {
      throw new ApiError(500, `OTP sending failed: ${error.message}`);
    }
  }

  async sendTemplateSMS(templateName, templateData, smsData) {
    try {
      const template = await this.getSMSTemplate(templateName);

      if (!template) {
        throw new ApiError(404, `SMS template '${templateName}' not found`);
      }

      // Render template with data
      const renderedMessage = this.renderTemplate(
        template.message,
        templateData
      );

      return await this.sendSMS({
        ...smsData,
        message: renderedMessage,
      });
    } catch (error) {
      throw new ApiError(500, `Template SMS sending failed: ${error.message}`);
    }
  }

  async getSMSTemplate(templateName) {
    // This would typically fetch from a database
    const templates = {
      welcome: {
        message:
          "Welcome to {{appName}}! Your account has been created successfully. - {{appName}} Team",
      },
      orderConfirmation: {
        message:
          "Hi {{firstName}}, your order #{{orderNumber}} has been confirmed. Total: {{totalAmount}}. Track: {{trackingLink}}",
      },
      otp: {
        message:
          "Your OTP is {{otp}}. Valid for {{expiryMinutes}} minutes. Do not share this with anyone. - {{appName}}",
      },
      passwordReset: {
        message:
          "Your password reset OTP is {{otp}}. Valid for {{expiryMinutes}} minutes. - {{appName}}",
      },
      deliveryUpdate: {
        message:
          "Hi {{firstName}}, your order #{{orderNumber}} is {{status}}. Expected delivery: {{deliveryDate}}. Track: {{trackingLink}}",
      },
      paymentReminder: {
        message:
          "Hi {{firstName}}, payment for order #{{orderNumber}} is pending. Amount: {{amount}}. Pay now: {{paymentLink}}",
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

  async validatePhoneNumber(phoneNumber) {
    try {
      // Remove all non-digit characters
      const cleaned = phoneNumber.replace(/\D/g, "");

      // Check if it's a valid length (7-15 digits)
      if (cleaned.length < 7 || cleaned.length > 15) {
        return {
          isValid: false,
          error: "Phone number must be between 7 and 15 digits",
        };
      }

      // Check if it starts with a valid country code or is a local number
      if (cleaned.startsWith("1") && cleaned.length === 11) {
        // US/Canada number
        return { isValid: true, formatted: `+${cleaned}` };
      } else if (cleaned.startsWith("91") && cleaned.length === 12) {
        // Indian number
        return { isValid: true, formatted: `+${cleaned}` };
      } else if (cleaned.length === 10) {
        // Assume it's a local number, add default country code
        const defaultCountryCode = config.sms.defaultCountryCode || "91";
        return { isValid: true, formatted: `+${defaultCountryCode}${cleaned}` };
      } else {
        return {
          isValid: false,
          error: "Invalid phone number format",
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: "Error validating phone number",
      };
    }
  }

  formatPhoneNumber(phoneNumber) {
    const validation = this.validatePhoneNumber(phoneNumber);
    return validation.isValid ? validation.formatted : phoneNumber;
  }

  async getDeliveryStatus(messageId) {
    try {
      if (config.sms.provider === "twilio" && this.client) {
        const message = await this.client.messages(messageId).fetch();
        return {
          messageId,
          status: message.status,
          errorCode: message.errorCode,
          errorMessage: message.errorMessage,
          price: message.price,
          priceUnit: message.priceUnit,
          dateCreated: message.dateCreated,
          dateUpdated: message.dateUpdated,
          dateSent: message.dateSent,
        };
      } else {
        // Mock status for development
        return {
          messageId,
          status: "delivered",
          timestamp: new Date(),
        };
      }
    } catch (error) {
      throw new ApiError(
        500,
        `Failed to get SMS delivery status: ${error.message}`
      );
    }
  }

  async getSMSStats(timeRange = "7d") {
    try {
      if (config.sms.provider === "twilio" && this.client) {
        // This would typically fetch from Twilio's API
        return {
          sent: 0,
          delivered: 0,
          failed: 0,
          undelivered: 0,
          timeRange,
        };
      } else {
        // Mock stats for development
        return {
          sent: 0,
          delivered: 0,
          failed: 0,
          undelivered: 0,
          timeRange,
        };
      }
    } catch (error) {
      throw new ApiError(500, `Failed to get SMS stats: ${error.message}`);
    }
  }

  async mockSendSMS(smsData) {
    // Mock SMS sending for development/testing
    console.log(`Mock SMS sent to ${smsData.to}: ${smsData.message}`);

    return {
      messageId: `mock_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      status: "sent",
      to: smsData.to,
      from: smsData.from,
      body: smsData.message,
      price: "0.00",
      priceUnit: "USD",
    };
  }

  async checkBalance() {
    try {
      if (config.sms.provider === "twilio" && this.client) {
        const account = await this.client.api
          .accounts(config.sms.accountSid)
          .fetch();
        return {
          balance: account.balance,
          currency: account.currency,
        };
      } else {
        // Mock balance for development
        return {
          balance: "100.00",
          currency: "USD",
        };
      }
    } catch (error) {
      throw new ApiError(500, `Failed to check SMS balance: ${error.message}`);
    }
  }
}

// Create singleton instance
const smsService = new SMSService();

module.exports = smsService;
