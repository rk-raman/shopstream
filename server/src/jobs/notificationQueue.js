/**
 * Notification Queue System
 *
 * Uses Bull (backed by Redis) to process notification sending asynchronously.
 * Each channel has its own queue with independent concurrency and retry settings.
 */

const Bull = require("bull");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Default job options
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000, // 5s, 10s, 20s
  },
  removeOnComplete: 100, // keep last 100 completed jobs
  removeOnFail: 200, // keep last 200 failed jobs
};

// --- Queue definitions ---

const emailQueue = new Bull("notification:email", REDIS_URL, {
  defaultJobOptions,
});

const smsQueue = new Bull("notification:sms", REDIS_URL, {
  defaultJobOptions,
});

const pushQueue = new Bull("notification:push", REDIS_URL, {
  defaultJobOptions,
});

const whatsappQueue = new Bull("notification:whatsapp", REDIS_URL, {
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 2,
  },
});

// --- Queue processors ---

emailQueue.process(5, async (job) => {
  // 5 concurrent email sends
  const emailService = require("../modules/notification/services/email.service");
  const { Notification } = require("../modules/notification/models");

  const { notificationId, to, subject, html, text } = job.data;

  const result = await emailService.sendEmail({ to, subject, html, text });

  // Update notification record
  if (notificationId) {
    const notification = await Notification.findById(notificationId);
    if (notification) {
      await notification.markChannelAsSent("email", {
        emailId: result?.messageId,
        jobId: job.id,
      });
    }
  }

  return { messageId: result?.messageId, to };
});

smsQueue.process(3, async (job) => {
  // 3 concurrent SMS sends
  const smsService = require("../modules/notification/services/sms.service");
  const { Notification } = require("../modules/notification/models");

  const { notificationId, to, message } = job.data;

  const result = await smsService.sendSMS({ to, message });

  if (notificationId) {
    const notification = await Notification.findById(notificationId);
    if (notification) {
      await notification.markChannelAsSent("sms", {
        messageId: result?.messageId,
        jobId: job.id,
      });
    }
  }

  return { messageId: result?.messageId, to };
});

pushQueue.process(10, async (job) => {
  // 10 concurrent push sends
  const pushService = require("../modules/notification/services/push.service");
  const { Notification } = require("../modules/notification/models");

  const { notificationId, recipient, title, body, icon, image, actionUrl, data } =
    job.data;

  const result = await pushService.sendPushNotification({
    recipient,
    title,
    body,
    icon,
    image,
    actionUrl,
    data,
  });

  if (notificationId) {
    const notification = await Notification.findById(notificationId);
    if (notification) {
      await notification.markChannelAsSent("push", {
        deviceTokens: result?.deviceTokens,
        jobId: job.id,
      });
    }
  }

  return result;
});

whatsappQueue.process(2, async (job) => {
  // 2 concurrent WhatsApp sends (rate limited by Meta)
  const whatsappService = require("../modules/notification/services/whatsapp.service");
  const { Notification } = require("../modules/notification/models");

  const { notificationId, to, templateName, templateData, message } = job.data;

  let result;
  if (templateName) {
    result = await whatsappService.sendTemplate({
      to,
      templateName,
      components: templateData,
    });
  } else {
    result = await whatsappService.sendMessage({ to, message });
  }

  if (notificationId) {
    const notification = await Notification.findById(notificationId);
    if (notification) {
      await notification.markChannelAsSent("whatsapp", {
        messageId: result?.messageId,
        jobId: job.id,
      });
    }
  }

  return { messageId: result?.messageId, to };
});

// --- Event handlers for logging ---

const queues = { emailQueue, smsQueue, pushQueue, whatsappQueue };

Object.entries(queues).forEach(([name, queue]) => {
  queue.on("completed", (job, result) => {
    console.log(
      `[Queue:${name}] Job ${job.id} completed`,
      result?.to || ""
    );
  });

  queue.on("failed", (job, err) => {
    console.error(
      `[Queue:${name}] Job ${job.id} failed (attempt ${job.attemptsMade}/${job.opts.attempts}):`,
      err.message
    );
  });

  queue.on("stalled", (job) => {
    console.warn(`[Queue:${name}] Job ${job.id || job} stalled`);
  });
});

// --- Helper: add notification to appropriate queues ---

const enqueueNotification = async ({
  notificationId,
  channels,
  user,
  title,
  message,
  subject,
  emailHtml,
  emailText,
  smsMessage,
  pushData,
  actionUrl,
  priority = "normal",
}) => {
  const jobPriority =
    priority === "urgent" ? 1 : priority === "high" ? 2 : priority === "low" ? 4 : 3;

  const jobs = [];

  if (channels.email?.enabled && user.email) {
    jobs.push(
      emailQueue.add(
        {
          notificationId,
          to: user.email,
          subject: subject || title,
          html:
            emailHtml ||
            `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#2874f0;">${title}</h2>
              <p>${message}</p>
              ${
                actionUrl
                  ? `<a href="${process.env.CLIENT_URL || "http://localhost:3000"}${actionUrl}" style="display:inline-block;padding:10px 24px;background:#2874f0;color:#fff;text-decoration:none;border-radius:4px;margin-top:12px;">View Details</a>`
                  : ""
              }
              <p style="color:#999;font-size:12px;margin-top:24px;">— ShopStream</p>
            </div>`,
          text: emailText || `${title}\n\n${message}`,
        },
        { priority: jobPriority }
      )
    );
  }

  if (channels.sms?.enabled && user.phone) {
    jobs.push(
      smsQueue.add(
        {
          notificationId,
          to: user.phone,
          message: smsMessage || `${title}: ${message}`,
        },
        { priority: jobPriority }
      )
    );
  }

  if (channels.push?.enabled) {
    jobs.push(
      pushQueue.add(
        {
          notificationId,
          recipient: user._id || user.id,
          title,
          body: message,
          actionUrl,
          data: pushData,
        },
        { priority: jobPriority }
      )
    );
  }

  if (channels.whatsapp?.enabled && user.phone) {
    jobs.push(
      whatsappQueue.add(
        {
          notificationId,
          to: user.phone,
          message: `*${title}*\n${message}`,
        },
        { priority: jobPriority }
      )
    );
  }

  return Promise.allSettled(jobs);
};

// --- Queue stats ---

const getQueueStats = async () => {
  const stats = {};
  for (const [name, queue] of Object.entries(queues)) {
    const counts = await queue.getJobCounts();
    stats[name] = counts;
  }
  return stats;
};

// --- Graceful shutdown ---

const closeQueues = async () => {
  await Promise.all(Object.values(queues).map((q) => q.close()));
  console.log("All notification queues closed");
};

module.exports = {
  emailQueue,
  smsQueue,
  pushQueue,
  whatsappQueue,
  enqueueNotification,
  getQueueStats,
  closeQueues,
};
