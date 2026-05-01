/**
 * Utility functions for premium feature checks
 */

/**
 * Check if user has premium access
 * @param {boolean} isPremium - User's premium status
 * @returns {boolean} true if user has premium access
 */
export const hasPremiumAccess = (isPremium) => {
  return isPremium === true;
};

/**
 * Get premium feature status
 * @param {boolean} isPremium - User's premium status
 * @param {string} feature - Feature name (optional, for future use)
 * @returns {Object} { hasAccess, isLocked, message }
 */
export const getPremiumFeatureStatus = (isPremium, feature = null) => {
  const hasAccess = hasPremiumAccess(isPremium);
  
  return {
    hasAccess,
    isLocked: !hasAccess,
    message: hasAccess ? 'Access granted' : 'Premium feature - Upgrade to unlock'
  };
};

/**
 * Check if analytics should be unlocked
 * @param {boolean} isPremium - User's premium status
 * @returns {boolean} true if analytics should be unlocked
 */
export const isAnalyticsUnlocked = (isPremium) => {
  return hasPremiumAccess(isPremium);
};

/**
 * Check if meditation videos should be unlimited
 * @param {boolean} isPremium - User's premium status
 * @returns {boolean} true if meditation should be unlimited
 */
export const isMeditationUnlimited = (isPremium) => {
  return hasPremiumAccess(isPremium);
};

/**
 * Check if therapy sessions should be unlimited
 * @param {boolean} isPremium - User's premium status
 * @returns {boolean} true if therapy should be unlimited
 */
export const isTherapyUnlimited = (isPremium) => {
  return hasPremiumAccess(isPremium);
};

