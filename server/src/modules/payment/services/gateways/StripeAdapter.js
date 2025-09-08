const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ApiError = require("../../../../shared/utils/apiError");

class StripeAdapter {
  constructor() {
    this.gateway = "stripe";
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  // Create payment intent
  async createPaymentIntent(paymentData) {
    try {
      const {
        amount,
        currency = "usd",
        metadata = {},
        paymentMethodTypes = ["card"],
        captureMethod = "automatic",
        confirmationMethod = "automatic",
      } = paymentData;

      // Convert amount to cents (Stripe expects amounts in smallest currency unit)
      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        payment_method_types: paymentMethodTypes,
        capture_method: captureMethod,
        confirmation_method: confirmationMethod,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created: paymentIntent.created,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      console.error("Stripe createPaymentIntent error:", error);
      throw new ApiError(400, `Stripe error: ${error.message}`);
    }
  }

  // Confirm payment intent
  async confirmPayment(paymentIntentId, confirmationData = {}) {
    try {
      const { paymentMethodId, returnUrl } = confirmationData;

      const confirmParams = {};
      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }
      if (returnUrl) {
        confirmParams.return_url = returnUrl;
      }

      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmParams
      );

      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        charges: paymentIntent.charges,
        last_payment_error: paymentIntent.last_payment_error,
        next_action: paymentIntent.next_action,
      };
    } catch (error) {
      console.error("Stripe confirmPayment error:", error);
      throw new ApiError(400, `Stripe error: ${error.message}`);
    }
  }

  // Retrieve payment intent
  async retrievePayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        charges: paymentIntent.charges,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      console.error("Stripe retrievePayment error:", error);
      throw new ApiError(400, `Stripe error: ${error.message}`);
    }
  }

  // Cancel payment intent
  async cancelPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        cancellation_reason: paymentIntent.cancellation_reason,
      };
    } catch (error) {
      console.error("Stripe cancelPayment error:", error);
      throw new ApiError(400, `Stripe error: ${error.message}`);
    }
  }

  // Create refund
  async createRefund(refundData) {
    try {
      const {
        paymentIntentId,
        amount,
        reason = "requested_by_customer",
      } = refundData;

      // Get the payment intent to find the charge
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (!paymentIntent.charges.data.length) {
        throw new ApiError(400, "No charges found for this payment intent");
      }

      const chargeId = paymentIntent.charges.data[0].id;
      const refundParams = {
        charge: chargeId,
        reason,
      };

      // Add amount if partial refund
      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundParams);

      return {
        id: refund.id,
        amount: refund.amount / 100, // Convert back to dollars
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        created: refund.created,
      };
    } catch (error) {
      console.error("Stripe createRefund error:", error);
      throw new ApiError(400, `Stripe error: ${error.message}`);
    }
  }

  // Create customer
  async createCustomer(customerData) {
    try {
      const { email, name, phone, address, metadata = {} } = customerData;

      const customer = await stripe.customers.create({
        email,
        name,
        phone,
        address,
        metadata,
      });

      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        created: customer.created,
      };
    } catch (error) {
      console.error("Stripe createCustomer error:", error);
      throw new ApiError(400, `Stripe error: ${error.message}`);
    }
  }

  // Attach payment method to customer
  async attachPaymentMethod(paymentMethodId, customerId) {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(
        paymentMethodId,
        {
          customer: customerId,
        }
      );

      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card,
        customer: paymentMethod.customer,
      };
    } catch (error) {
      console.error("Stripe attachPaymentMethod error:", error);
      throw new ApiError(400, `Stripe error: ${error.message}`);
    }
  }

  // List customer payment methods
  async listPaymentMethods(customerId, type = "card") {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type,
      });

      return paymentMethods.data.map((pm) => ({
        id: pm.id,
        type: pm.type,
        card: pm.card
          ? {
              brand: pm.card.brand,
              last4: pm.card.last4,
              exp_month: pm.card.exp_month,
              exp_year: pm.card.exp_year,
            }
          : null,
      }));
    } catch (error) {
      console.error("Stripe listPaymentMethods error:", error);
      throw new ApiError(400, `Stripe error: ${error.message}`);
    }
  }

  // Create setup intent for saving payment methods
  async createSetupIntent(customerId, paymentMethodTypes = ["card"]) {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: paymentMethodTypes,
        usage: "off_session",
      });

      return {
        id: setupIntent.id,
        client_secret: setupIntent.client_secret,
        status: setupIntent.status,
      };
    } catch (error) {
      console.error("Stripe createSetupIntent error:", error);
      throw new ApiError(400, `Stripe error: ${error.message}`);
    }
  }

  // Verify webhook signature
  async verifyWebhook(payload, signature) {
    try {
      if (!this.webhookSecret) {
        console.warn("Stripe webhook secret not configured");
        return false;
      }

      stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
      return true;
    } catch (error) {
      console.error("Stripe webhook verification failed:", error);
      return false;
    }
  }

  // Parse webhook event
  parseWebhookEvent(payload) {
    try {
      return JSON.parse(payload);
    } catch (error) {
      throw new ApiError(400, "Invalid webhook payload");
    }
  }

  // Get supported payment methods
  getSupportedPaymentMethods() {
    return [
      "card",
      "apple_pay",
      "google_pay",
      "link",
      "us_bank_account",
      "sepa_debit",
    ];
  }

  // Get supported currencies
  getSupportedCurrencies() {
    return [
      "usd",
      "eur",
      "gbp",
      "cad",
      "aud",
      "jpy",
      "chf",
      "sek",
      "nok",
      "dkk",
      "pln",
      "czk",
      "huf",
      "bgn",
      "hrk",
      "ron",
      "inr",
      "sgd",
      "hkd",
      "mxn",
      "brl",
      "myr",
      "thb",
      "php",
      "krw",
      "twd",
      "try",
      "rub",
      "zar",
      "aed",
    ];
  }

  // Format amount for display
  formatAmount(amount, currency) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  // Validate payment data
  validatePaymentData(paymentData) {
    const { amount, currency } = paymentData;

    if (!amount || amount <= 0) {
      throw new ApiError(400, "Invalid payment amount");
    }

    if (
      !currency ||
      !this.getSupportedCurrencies().includes(currency.toLowerCase())
    ) {
      throw new ApiError(400, "Unsupported currency");
    }

    // Stripe minimum amounts by currency
    const minimumAmounts = {
      usd: 0.5,
      eur: 0.5,
      gbp: 0.3,
      cad: 0.5,
      aud: 0.5,
      jpy: 50,
      // Add more as needed
    };

    const minAmount = minimumAmounts[currency.toLowerCase()] || 0.5;
    if (amount < minAmount) {
      throw new ApiError(
        400,
        `Minimum amount for ${currency.toUpperCase()} is ${minAmount}`
      );
    }

    return true;
  }

  // Handle 3D Secure authentication
  async handle3DSecure(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (
        paymentIntent.status === "requires_action" &&
        paymentIntent.next_action?.type === "use_stripe_sdk"
      ) {
        return {
          requiresAction: true,
          clientSecret: paymentIntent.client_secret,
          nextAction: paymentIntent.next_action,
        };
      }

      return {
        requiresAction: false,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error("Stripe 3D Secure handling error:", error);
      throw new ApiError(400, `Stripe error: ${error.message}`);
    }
  }

  // Get payment method details
  async getPaymentMethodDetails(paymentMethodId) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentMethodId
      );

      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card
          ? {
              brand: paymentMethod.card.brand,
              last4: paymentMethod.card.last4,
              exp_month: paymentMethod.card.exp_month,
              exp_year: paymentMethod.card.exp_year,
              funding: paymentMethod.card.funding,
              country: paymentMethod.card.country,
            }
          : null,
        billing_details: paymentMethod.billing_details,
      };
    } catch (error) {
      console.error("Stripe getPaymentMethodDetails error:", error);
      throw new ApiError(400, `Stripe error: ${error.message}`);
    }
  }
}

module.exports = StripeAdapter;
