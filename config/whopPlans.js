/**
 * Whop Plan ID Configuration
 * 
 * Map your old Lemon Squeezy product IDs to Whop plan IDs
 * Update these with your actual Whop plan IDs from your Whop dashboard
 */

export const WHOP_PLANS = {
  // Monthly Premium Plan
  // Old Lemon Squeezy ID: 901b37d4-dadd-4720-9acb-1f56fd1680a0
  MONTHLY_PREMIUM: process.env.EXPO_PUBLIC_WHOP_PLAN_MONTHLY || 'plan_c5er4enOj8dVH',
  
  // Annual Premium Plan
  // Old Lemon Squeezy ID: 25a4e2d5-9426-4784-a712-9038da5f6000
  ANNUAL_PREMIUM: process.env.EXPO_PUBLIC_WHOP_PLAN_ANNUAL || 'plan_WbwiJnavIn7fV',
  
  // Lifetime Pro Plan
  // Old Lemon Squeezy ID: 75609360-bec8-4c80-889d-0ef7262e491d
  // Note: Not connected at this moment
  LIFETIME_PRO: process.env.EXPO_PUBLIC_WHOP_PLAN_LIFETIME || null,
};

/**
 * Legacy product ID to Whop plan ID mapping
 * This helps migrate from old Lemon Squeezy product IDs
 */
export const LEGACY_TO_WHOP_MAP = {
  '901b37d4-dadd-4720-9acb-1f56fd1680a0': WHOP_PLANS.MONTHLY_PREMIUM,
  '25a4e2d5-9426-4784-a712-9038da5f6000': WHOP_PLANS.ANNUAL_PREMIUM,
  '75609360-bec8-4c80-889d-0ef7262e491d': WHOP_PLANS.LIFETIME_PRO, // Will be null until lifetime plan is connected
};

/**
 * Get Whop plan ID from legacy product ID
 * Returns null if the plan is not configured (e.g., lifetime plan not connected)
 */
export const getWhopPlanId = (legacyProductId) => {
  const planId = LEGACY_TO_WHOP_MAP[legacyProductId];
  // Return null if plan is not configured, otherwise return the plan ID or fallback to legacy ID
  if (planId === null || planId === undefined) {
    return null;
  }
  return planId || legacyProductId;
};