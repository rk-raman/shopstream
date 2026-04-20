/**
 * WhatsApp Service
 *
 * Supports two providers:
 * 1. Meta Cloud API (official WhatsApp Business API)
 * 2. Twilio WhatsApp (easier setup, sandbox available)
 *
 * Environment variables:
 *   WHATSAPP_PROVIDER=meta|twilio
 *
 *   # Meta Cloud API
 *   WHATSAPP_PHONE_NUMBER_ID=<your phone number ID>
 *   WHATSAPP_ACCESS_TOKEN=<permanent or temporary token>
 *   WHATSAPP_BUSINESS_ACCOUNT_ID=<business account ID>
 *   WHATSAPP_VERIFY_TOKEN=<webhook verify token>
 *
 *   # Twilio WhatsApp
 *   TWILIO_ACCOUNT_SID=<sid>
 *   TWILIO_AUTH_TOKEN=<token>
 *   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
 */

const axios = require("axios");

class WhatsAppService {
  constructor() {
    this.provider = process.env.WHATSAPP_PROVIDER || "meta";
    this.enabled = !!(
      process.env.WHATSAPP_ACCESS_TOKEN || process.env.TWILIO_ACCOUNT_SID
    );

    if (this.provider === "twilio") {
      this.initTwilio();
    } else {
      this.initMeta();
    }

    console.log(
      this.enabled
        ? `WhatsApp service initialized (${this.provider})`
        : "WhatsApp service initialized in mock mode (disabled)"
    );
  }

  initMeta() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.apiVersion = process.env.WHATSAPP_API_VERSION || "v18.0";
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
  }

  initTwilio() {
    try {
      const twilio = require("twilio");
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.twilioFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
    } catch (err) {
      console.warn("Twilio WhatsApp init failed:", err.message);
    }
  }

  /**
   * Send a text message
   */
  async sendMessage({ to, message }) {
    const formattedTo = this.formatPhoneNumber(to);

    if (!this.enabled) {
      return this.mockSend(formattedTo, message);
    }

    if (this.provider === "twilio") {
      return this.sendViaTwilio(formattedTo, message);
    }

    return this.sendViaMeta(formattedTo, { type: "text", text: { body: message } });
  }

  /**
   * Send a template message (required by Meta for initiating conversations)
   */
  async sendTemplate({ to, templateName, languageCode = "en", components = [] }) {
    const formattedTo = this.formatPhoneNumber(to);

    if (!this.enabled) {
      return this.mockSend(formattedTo, `[Template: ${templateName}]`);
    }

    if (this.provider === "twilio") {
      // Twilio uses content SID for templates
      return this.sendViaTwilio(
        formattedTo,
        `[Template: ${templateName}]` // Twilio sandbox doesn't support templates directly
      );
    }

    return this.sendViaMeta(formattedTo, {
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    });
  }

  /**
   * Send order confirmation via WhatsApp
   */
  async sendOrderConfirmation({ to, orderNumber, totalAmount, itemCount }) {
    const message = `*Order Confirmed!* ✅\n\nOrder: #${orderNumber}\nItems: ${itemCount}\nTotal: ₹${totalAmount.toLocaleString("en-IN")}\n\nTrack your order in the ShopStream app.`;
    return this.sendMessage({ to, message });
  }

  /**
   * Send shipping update via WhatsApp
   */
  async sendShippingUpdate({ to, orderNumber, trackingNumber, carrier }) {
    const message = `*Order Shipped!* 📦\n\nOrder: #${orderNumber}\nCarrier: ${carrier}\nTracking: ${trackingNumber}\n\nYour order is on its way!`;
    return this.sendMessage({ to, message });
  }

  /**
   * Send delivery confirmation via WhatsApp
   */
  async sendDeliveryConfirmation({ to, orderNumber }) {
    const message = `*Order Delivered!* 🎉\n\nOrder: #${orderNumber}\n\nYour order has been delivered. We hope you love it!\n\nRate your experience in the ShopStream app.`;
    return this.sendMessage({ to, message });
  }

  /**
   * Send OTP via WhatsApp
   */
  async sendOTP({ to, otp, expiresInMinutes = 5 }) {
    const message = `Your ShopStream verification code is: *${otp}*\n\nThis code expires in ${expiresInMinutes} minutes. Do not share it with anyone.`;
    return this.sendMessage({ to, message });
  }

  // --- Internal: Meta Cloud API ---

  async sendViaMeta(to, messagePayload) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          ...messagePayload,
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        to,
        provider: "meta",
      };
    } catch (error) {
      const errMsg =
        error.response?.data?.error?.message || error.message;
      console.error(`[WhatsApp:Meta] Send failed to ${to}:`, errMsg);
      throw new Error(`WhatsApp send failed: ${errMsg}`);
    }
  }

  // --- Internal: Twilio WhatsApp ---

  async sendViaTwilio(to, body) {
    try {
      const message = await this.twilioClient.messages.create({
        from: this.twilioFrom,
        to: `whatsapp:${to}`,
        body,
      });

      return {
        success: true,
        messageId: message.sid,
        to,
        provider: "twilio",
        status: message.status,
      };
    } catch (error) {
      console.error(`[WhatsApp:Twilio] Send failed to ${to}:`, error.message);
      throw new Error(`WhatsApp send failed: ${error.message}`);
    }
  }

  // --- Internal: Mock ---

  mockSend(to, message) {
    console.log(`[WhatsApp:Mock] To: ${to} | Message: ${message.substring(0, 80)}...`);
    return {
      success: true,
      messageId: `mock_wa_${Date.now()}`,
      to,
      provider: "mock",
    };
  }

  // --- Helpers ---

  formatPhoneNumber(phone) {
    if (!phone) return phone;
    let cleaned = phone.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+")) {
      // Default to India country code
      if (cleaned.length === 10) {
        cleaned = `+91${cleaned}`;
      } else {
        cleaned = `+${cleaned}`;
      }
    }
    return cleaned;
  }

  /**
   * Verify webhook (for Meta Cloud API)
   */
  verifyWebhook(mode, token, challenge) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    if (mode === "subscribe" && token === verifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Parse incoming webhook payload (for delivery status)
   */
  parseWebhookPayload(body) {
    try {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      if (value?.statuses) {
        // Status update
        return value.statuses.map((status) => ({
          type: "status",
          messageId: status.id,
          recipientId: status.recipient_id,
          status: status.status, // sent, delivered, read, failed
          timestamp: status.timestamp,
          errors: status.errors,
        }));
      }

      if (value?.messages) {
        // Incoming message (reply)
        return value.messages.map((msg) => ({
          type: "message",
          messageId: msg.id,
          from: msg.from,
          text: msg.text?.body,
          timestamp: msg.timestamp,
        }));
      }

      return [];
    } catch (error) {
      console.error("[WhatsApp] Webhook parse error:", error.message);
      return [];
    }
  }
}

module.exports = new WhatsAppService();
