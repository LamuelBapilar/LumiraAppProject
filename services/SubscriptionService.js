import { getSupabaseClient } from '@/utils/supabaseWellness';

class SubscriptionService {
  /**
   * Fetch subscription for the current user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Subscription object
   */
  async getSubscription(userId) {
    try {
      const client = await getSupabaseClient();
      const { data, error } = await client
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Supabase error fetching subscription:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  /**
   * Format subscription data for display
   * @param {Object} subscription - Raw subscription object from database
   * @returns {Object} Formatted subscription object
   */
  formatSubscription(subscription) {
    if (!subscription) return null;

    return {
      id: subscription.id,
      lemonSubscriptionId: subscription.lemon_subscription_id,
      status: subscription.status || 'Unknown',
      planName: subscription.plan_name || subscription.variant_name || 'Calmive Pro',
      price: subscription.variant_name
        ? this.getPriceFromVariant(subscription.variant_name)
        : '$14.99',
      currency: subscription.currency || 'USD',
      interval:
        subscription.interval ||
        this.getIntervalFromVariant(subscription.variant_name) ||
        'month',
      renewsAt: subscription.renews_at
        ? new Date(subscription.renews_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : null,
      createdAt: subscription.created_at
        ? new Date(subscription.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A',
      updatedAt: subscription.updated_at
        ? new Date(subscription.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A',
      // Card information from subscription
      cardBrand: subscription.card_brand,
      cardLastFour: subscription.card_last_four,
      customerPortalUrl: subscription.customer_portal_url,
      updatePaymentMethodUrl: subscription.update_payment_method_url,
      manageSubscriptionUrl: subscription.manage_subscription_url,
    };
  }

  /**
   * Get price from variant name
   * @param {string} variantName - Variant name from subscription
   * @returns {string} Formatted price
   */
  getPriceFromVariant(variantName) {
    if (!variantName) return '$14.99';

    const lowerVariant = variantName.toLowerCase();

    if (lowerVariant.includes('monthly') || lowerVariant.includes('month')) {
      return '$14.99';
    }

    if (
      lowerVariant.includes('annual') ||
      lowerVariant.includes('yearly') ||
      lowerVariant.includes('year')
    ) {
      return '$49.99';
    }

    if (lowerVariant.includes('lifetime') || lowerVariant.includes('one-time')) {
      return '$49.99';
    }

    return '$14.99';
  }

  /**
   * Get interval from variant name
   * @param {string} variantName - Variant name from subscription
   * @returns {string} Interval (month, year, lifetime)
   */
  getIntervalFromVariant(variantName) {
    if (!variantName) return 'month';

    const lowerVariant = variantName.toLowerCase();

    if (lowerVariant.includes('lifetime') || lowerVariant.includes('one-time')) {
      return 'lifetime';
    }

    if (
      lowerVariant.includes('annual') ||
      lowerVariant.includes('yearly') ||
      lowerVariant.includes('year')
    ) {
      return 'year';
    }

    return 'month';
  }

  /**
   * Get payment methods from subscription data
   * @param {Object} subscription - Subscription object with card information
   * @returns {Array} Array of payment methods
   */
  getPaymentMethodsFromSubscription(subscription) {
    if (!subscription || !subscription.cardBrand || !subscription.cardLastFour) {
      return [];
    }

    return [
      {
        brand: subscription.cardBrand,
        last4: subscription.cardLastFour,
        holder: 'Card Holder',
        isDefault: true,
      },
    ];
  }
}

class UserService {
  /**
   * Fetch user data including premium status
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUser(userId) {
    try {
      const client = await getSupabaseClient();
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Supabase error fetching user:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Format user data for display
   * @param {Object} user - Raw user object from database
   * @returns {Object} Formatted user object
   */
  formatUser(user) {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      isPremium: user.is_premium || false,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}

export default new SubscriptionService();
export const userService = new UserService();