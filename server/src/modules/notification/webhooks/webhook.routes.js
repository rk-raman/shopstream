const express = require("express");
const router = express.Router();
const webhookController = require("./webhook.controller");

// Twilio SMS delivery status
router.post("/twilio/sms", webhookController.handleTwilioSMSWebhook);

// SendGrid email events
router.post("/sendgrid/email", webhookController.handleSendGridWebhook);

// WhatsApp (Meta Cloud API)
router.get("/whatsapp", webhookController.verifyWhatsAppWebhook);
router.post("/whatsapp", webhookController.handleWhatsAppWebhook);

module.exports = router;
