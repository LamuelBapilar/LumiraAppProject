/**
 * Stripe Price ID Configuration
 * 
 * Map your old Lemon Squeezy / Whop product IDs to Stripe Price IDs.
 * Update these with your actual Stripe Price IDs from the Stripe Dashboard.
 */

export const STRIPE_PRICES = {
  // Monthly Premium Plan
  // Old Lemon Squeezy ID: 901b37d4-dadd-4720-9acb-1f56fd1680a0
  MONTHLY_PREMIUM: process.env.EXPO_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_1TEtzIEezhbCWNLhuL1R4We4',
  
  // Annual Premium Plan
  // Old Lemon Squeezy ID: 25a4e2d5-9426-4784-a712-9038da5f6000
  ANNUAL_PREMIUM: process.env.EXPO_PUBLIC_STRIPE_PRICE_ANNUAL || 'price_1TEu1LEezhbCWNLh5dtwq9Eb',
  
  // Lifetime Pro Plan (not connected yet)
  // Old Lemon Squeezy ID: 75609360-bec8-4c80-889d-0ef7262e491d
  LIFETIME_PRO: process.env.EXPO_PUBLIC_STRIPE_PRICE_LIFETIME || 'price_1TEu2IEezhbCWNLhBdWnwEuR',
};

/**
 * Legacy product ID to Stripe Price ID mapping
 * This helps migrate from old Lemon Squeezy / Whop product IDs
 */
export const LEGACY_TO_STRIPE_MAP = {
  '901b37d4-dadd-4720-9acb-1f56fd1680a0': STRIPE_PRICES.MONTHLY_PREMIUM,
  '25a4e2d5-9426-4784-a712-9038da5f6000': STRIPE_PRICES.ANNUAL_PREMIUM,
  '75609360-bec8-4c80-889d-0ef7262e491d': STRIPE_PRICES.LIFETIME_PRO,
};

/**
 * Get Stripe Price ID from legacy product ID
 * Returns null if the plan is not configured
 */
export const getStripePriceId = (legacyProductId) => {
  const priceId = LEGACY_TO_STRIPE_MAP[legacyProductId];
  if (priceId === null || priceId === undefined) {
    return null;
  }
  return priceId || legacyProductId;
};