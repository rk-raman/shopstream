/**
 * Webhook Controller
 *
 * Handles delivery status callbacks from external providers:
 * - Twilio (SMS delivery status)
 * - SendGrid (email delivery, opens, clicks, bounces)
 * - Meta WhatsApp Cloud API (message status)
 */

const { Notification } = require("../models");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// ==================== TWILIO SMS WEBHOOK ====================

/**
 * POST /api/webhooks/twilio/sms
 *
 * Twilio sends status updates for each SMS.
 * Body: { MessageSid, MessageStatus, To, From, ErrorCode?, ErrorMessage? }
 * Statuses: queued, sent, delivered, undelivered, failed
 */
const handleTwilioSMSWebhook = asyncHandler(async (req, res) => {
  const { MessageSid, MessageStatus, To, ErrorCode, ErrorMessage } = req.body;

  console.log(
    `[Webhook:Twilio] SMS ${MessageSid} → ${MessageStatus} (to: ${To})`
  );

  // Find notification by SMS messageId
  const notification = await Notification.findOne({
    "channels.sms.deliveryData.messageId": MessageSid,
  });

  if (notification) {
    if (MessageStatus === "delivered") {
      notification.channels.sms.delivered = true;
      notification.channels.sms.deliveredAt = new Date();
    } else if (["failed", "undelivered"].includes(MessageStatus)) {
      notification.channels.sms.failed = true;
      notification.channels.sms.error = ErrorMessage || `Status: ${MessageStatus}`;
    }

    notification.channels.sms.deliveryData = {
      ...notification.channels.sms.deliveryData,
      lastStatus: MessageStatus,
      lastStatusAt: new Date(),
      errorCode: ErrorCode,
    };

    await notification.save();
  }

  // Twilio expects 200 OK
  return res.status(200).send("OK");
});

// ==================== SENDGRID EMAIL WEBHOOK ====================

/**
 * POST /api/webhooks/sendgrid/email
 *
 * SendGrid sends batched event webhooks.
 * Body: [{ email, event, sg_message_id, timestamp, ... }]
 * Events: processed, delivered, open, click, bounce, dropped, deferred, spam_report
 */
const handleSendGridWebhook = asyncHandler(async (req, res) => {
  const events = Array.isArray(req.body) ? req.body : [req.body];

  for (const event of events) {
    const { email, event: eventType, sg_message_id, timestamp } = event;

    console.log(
      `[Webhook:SendGrid] ${eventType} for ${email} (${sg_message_id})`
    );

    const notification = await Notification.findOne({
      "channels.email.deliveryData.emailId": { $regex: sg_message_id },
    });

    if (!notification) continue;

    switch (eventType) {
      case "delivered":
        notification.channels.email.delivered = true;
        notification.channels.email.deliveredAt = new Date(timestamp * 1000);
        break;
      case "open":
        notification.openedAt = notification.openedAt || new Date(timestamp * 1000);
        break;
      case "click":
        notification.clickedAt = notification.clickedAt || new Date(timestamp * 1000);
        break;
      case "bounce":
      case "dropped":
        notification.channels.email.failed = true;
        notification.channels.email.error = `${eventType}: ${event.reason || "Unknown"}`;
        break;
      case "spam_report":
        notification.channels.email.failed = true;
        notification.channels.email.error = "Marked as spam";
        break;
    }

    notification.channels.email.deliveryData = {
      ...notification.channels.email.deliveryData,
      lastEvent: eventType,
      lastEventAt: new Date(timestamp * 1000),
    };

    await notification.save();
  }

  return res.status(200).send("OK");
});

// ==================== META WHATSAPP WEBHOOK ====================

/**
 * GET /api/webhooks/whatsapp
 * Verification endpoint for Meta webhook setup.
 */
const verifyWhatsAppWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const whatsappService = require("../services/whatsapp.service");
  const result = whatsappService.verifyWebhook(mode, token, challenge);

  if (result) {
    return res.status(200).send(result);
  }
  return res.status(403).send("Forbidden");
};

/**
 * POST /api/webhooks/whatsapp
 * Receives message status updates and incoming messages.
 */
const handleWhatsAppWebhook = asyncHandler(async (req, res) => {
  const whatsappService = require("../services/whatsapp.service");
  const events = whatsappService.parseWebhookPayload(req.body);

  for (const event of events) {
    if (event.type === "status") {
      console.log(
        `[Webhook:WhatsApp] Message ${event.messageId} → ${event.status}`
      );

      const notification = await Notification.findOne({
        "channels.whatsapp.deliveryData.messageId": event.messageId,
      });

      if (notification) {
        if (event.status === "delivered") {
          notification.channels.whatsapp.delivered = true;
          notification.channels.whatsapp.deliveredAt = new Date(
            event.timestamp * 1000
          );
        } else if (event.status === "read") {
          notification.openedAt =
            notification.openedAt || new Date(event.timestamp * 1000);
        } else if (event.status === "failed") {
          notification.channels.whatsapp.failed = true;
          notification.channels.whatsapp.error =
            event.errors?.[0]?.message || "Delivery failed";
        }

        notification.channels.whatsapp.deliveryData = {
          ...notification.channels.whatsapp.deliveryData,
          lastStatus: event.status,
          lastStatusAt: new Date(),
        };

        await notification.save();
      }
    }

    if (event.type === "message") {
      // Incoming reply — log for now, could trigger auto-responses
      console.log(
        `[Webhook:WhatsApp] Reply from ${event.from}: ${event.text}`
      );
    }
  }

  return res.status(200).send("OK");
});

module.exports = {
  handleTwilioSMSWebhook,
  handleSendGridWebhook,
  verifyWhatsAppWebhook,
  handleWhatsAppWebhook,
};
