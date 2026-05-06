//PaymentsService.js
import { getStripePriceId, STRIPE_PRICES } from '@/config/stripePlans';
import { getSupabaseClient } from '@/utils/supabaseWellness';

class PaymentsService {
  /**
   * @deprecated Use getStripePriceId instead. This method is kept for backward compatibility.
   */
  buildCheckoutUrl(productId, { email, uid } = {}) {
    const base = `https://pay.calmive.io/buy/${productId}`;
    const params = new URLSearchParams();
    if (email) params.set('checkout[email]', email);
    if (uid) params.set('uid', uid);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  /**
   * Get Stripe Price ID from legacy product ID or return the price ID directly
   * @param {string} productId - Legacy Lemon Squeezy product ID or Stripe Price ID
   * @returns {string} Stripe Price ID
   */
  getStripePriceId(productId) {
    return getStripePriceId(productId);
  }

  /**
   * Get Stripe Price IDs for common plans
   */
  getStripePrices() {
    return STRIPE_PRICES;
  }

  /**
   * Create a Stripe Checkout Session via Supabase Edge Function
   * @param {string} priceId - Stripe Price ID
   * @param {string} email - User email
   * @param {string} userId - Clerk user ID
   * @returns {Promise<{url: string, sessionId: string}>} Checkout session URL
   */
  async createCheckoutSession(priceId, email, userId) {
    try {
      // Get the initialized client to ensure we have the correct URL and Anon Key
      // This handles cases where .env variables might be missing and fallbacks are used.
      const client = await getSupabaseClient();
      const supabaseUrl = client.supabaseUrl;
      const supabaseAnonKey = client.supabaseKey;

      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          priceId,
          email,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create checkout session (${response.status})`);
      }

      const data = await response.json();
      return { url: data.url, sessionId: data.sessionId };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Create a Stripe Billing Portal Session via Supabase Edge Function
   * @param {string} userId - Clerk user ID
   * @returns {Promise<string>} Portal session URL
   */
  async createPortalSession(userId) {
    try {
      const client = await getSupabaseClient();
      const supabaseUrl = client.supabaseUrl;
      const supabaseAnonKey = client.supabaseKey;

      const response = await fetch(`${supabaseUrl}/functions/v1/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create portal session (${response.status})`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  /**
   * Check Stripe Customer history for a successful Lifetime Payment ($49.99)
   * @param {string} userId - Clerk user ID
   * @returns {Promise<boolean>} True if user bought lifetime
   */
  async checkLifetimeStatus(userId) {
    try {
      const client = await getSupabaseClient();
      const supabaseUrl = client.supabaseUrl;
      const supabaseAnonKey = client.supabaseKey;

      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-lifetime-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return Boolean(data.isLifetime);
    } catch (error) {
      console.error('Error checking lifetime status:', error);
      return false;
    }
  }

  getBillingPortalUrl({ email, uid, token, attempt } = {}) {
    const billingBase =
      process.env.EXPO_PUBLIC_LEMON_BILLING_URL || 'https://pay.calmive.io/billing';
    const params = new URLSearchParams();
    if (email) params.set('email', email);
    if (uid) params.set('uid', uid);
    // Prefer API key from env for presigned access
    // global replaces window in React Native
    const apiKey =
      global.__LEMON_BILLING_API_KEY__ ||
      process.env.EXPO_PUBLIC_LEMON_BILLING_API_KEY;
    if (apiKey) params.set('api_key', apiKey);
    // Fallback to token support if provided explicitly
    const presigned =
      token ||
      global.__LEMON_BILLING_TOKEN__ ||
      process.env.EXPO_PUBLIC_LEMON_BILLING_TOKEN;
    if (!apiKey && presigned) params.set('token', presigned);
    if (attempt) params.set('attempt', String(attempt));
    const qs = params.toString();
    return qs ? `${billingBase}?${qs}` : billingBase;
  }

  /**
   * Fetch payments for the current user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of payment objects
   */
  async getPayments(userId) {
    try {
      const client = await getSupabaseClient();
      const { data, error } = await client
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('paid_at', { ascending: false, nullsFirst: false })
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Supabase error fetching payments:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific payment by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Payment object
   */
  async getPaymentById(paymentId) {
    try {
      const client = await getSupabaseClient();
      const { data, error } = await client
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) {
        console.error('Supabase error fetching payment:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  /**
   * Format payment data for display
   * @param {Object} payment - Raw payment object from database
   * @returns {Object} Formatted payment object
   */
  formatPayment(payment) {
    return {
      id: payment.id,
      lemonPaymentId: payment.lemon_payment_id,
      amount: payment.amount ? `$${parseFloat(payment.amount).toFixed(2)}` : '$0.00',
      currency: payment.currency || 'USD',
      status: payment.status || 'Unknown',
      cardBrand: payment.card_brand,
      cardLastFour: payment.card_last_four,
      refunded: payment.refunded || false,
      refundedAmount: payment.refunded_amount
        ? `$${parseFloat(payment.refunded_amount).toFixed(2)}`
        : null,
      paidAt: payment.paid_at
        ? new Date(payment.paid_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A',
      updatedAt: payment.updated_at
        ? new Date(payment.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A',
      invoiceUrl: payment.invoice_url,
      billingReason: payment.billing_reason || 'initial',
      paymentProcessor: payment.payment_processor || 'stripe',
      customerId: payment.customer_id,
    };
  }

  /**
   * Format multiple payments for display
   * @param {Array} payments - Array of raw payment objects
   * @returns {Array} Array of formatted payment objects
   */
  formatPayments(payments) {
    return payments.map((payment) => this.formatPayment(payment));
  }

  /**
   * Get unique payment methods from payments
   * @param {Array} payments - Array of payment objects
   * @returns {Array} Array of unique payment methods
   */
  getPaymentMethods(payments) {
    const methods = new Map();

    payments.forEach((payment) => {
      if (payment.card_brand && payment.card_last_four) {
        const key = `${payment.card_brand}-${payment.card_last_four}`;
        if (!methods.has(key)) {
          methods.set(key, {
            brand: payment.card_brand,
            last4: payment.card_last_four,
            holder: 'Card Holder',
            isDefault: false,
          });
        }
      }
    });

    return Array.from(methods.values());
  }
}

export default new PaymentsService();