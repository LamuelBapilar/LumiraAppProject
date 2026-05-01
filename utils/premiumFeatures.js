// Premium Features Strategy for $14.99/month plan

export const PREMIUM_FEATURES = {
  // FREE FEATURES
  free: {
    wellnessScore: true,
    basicGraph: true,
    moodTracking: true,
    basicInsights: true,
    dailyReminders: true
  },
  
  // PREMIUM FEATURES ($14.99/month)
  premium: {
    // Advanced Analytics
    advancedGraphs: true,
    trendForecasting: true,
    correlationAnalysis: true,
    customTimeRanges: true,
    
    // AI-Powered Insights
    emotionPrediction: true,
    voiceEmotionAnalysis: true,
    imageEmotionAnalysis: true,
    personalizedRecommendations: true,
    
    // Advanced Wellness Features
    sleepTracking: true,
    stressBiomarkers: true,
    focusOptimization: true,
    energyOptimization: true,
    
    // Social & Community
    wellnessChallenges: true,
    communitySupport: true,
    expertConsultations: true,
    groupMeditation: true,
    
    // Advanced Personalization
    customWellnessGoals: true,
    advancedNotifications: true,
    dataExport: true,
    apiAccess: true
  }
};

// Feature descriptions for UI
export const FEATURE_DESCRIPTIONS = {
  // Free Features
  wellnessScore: {
    title: 'Basic Wellness Score',
    description: 'Daily wellness calculation based on mood, energy, and activities',
    icon: '📊'
  },
  basicGraph: {
    title: '7-Day Wellness Graph',
    description: 'Simple line chart showing your wellness trend',
    icon: '📈'
  },
  moodTracking: {
    title: 'Mood Tracking',
    description: 'Log daily moods with emojis and intensity levels',
    icon: '😊'
  },
  
  // Premium Features
  advancedGraphs: {
    title: 'Advanced Analytics',
    description: 'Multi-dimensional graphs, correlations, and deep insights',
    icon: '📊',
    premium: true
  },
  trendForecasting: {
    title: 'AI Trend Prediction',
    description: 'Predict your wellness score for the next 7-30 days',
    icon: '🔮',
    premium: true
  },
  emotionPrediction: {
    title: 'Emotion Prediction',
    description: 'AI predicts your mood based on patterns and triggers',
    icon: '🧠',
    premium: true
  },
  voiceEmotionAnalysis: {
    title: 'Voice Emotion Analysis',
    description: 'Analyze emotional state from voice recordings',
    icon: '🎤',
    premium: true
  },
  imageEmotionAnalysis: {
    title: 'Image Emotion Analysis',
    description: 'Analyze facial expressions and emotional state from photos',
    icon: '📷',
    premium: true
  },
  sleepTracking: {
    title: 'Sleep Optimization',
    description: 'Track sleep patterns and get personalized sleep advice',
    icon: '😴',
    premium: true
  },
  stressBiomarkers: {
    title: 'Stress Biomarkers',
    description: 'Advanced stress tracking with physiological indicators',
    icon: '💓',
    premium: true
  },
  personalizedRecommendations: {
    title: 'AI Recommendations',
    description: 'Personalized wellness recommendations based on your data',
    icon: '🎯',
    premium: true
  },
  wellnessChallenges: {
    title: 'Wellness Challenges',
    description: 'Join community challenges and track progress',
    icon: '🏆',
    premium: true
  },
  expertConsultations: {
    title: 'Expert Consultations',
    description: 'Monthly sessions with wellness experts',
    icon: '👨‍⚕️',
    premium: true
  }
};

// Pricing tiers
export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: Object.keys(PREMIUM_FEATURES.free),
    cta: 'Get Started',
    popular: false
  },
  premium: {
    name: 'Premium',
    price: '$14.99',
    period: 'per month',
    features: Object.keys(PREMIUM_FEATURES.premium),
    cta: 'Start Free Trial',
    popular: true,
    trialDays: 14,
    savings: 'Save 20% with annual billing'
  }
};

// Check if user has access to a feature
export const hasFeatureAccess = (userSubscription, featureName) => {
  if (!userSubscription || userSubscription.tier === 'free') {
    return PREMIUM_FEATURES.free[featureName] || false;
  }
  
  if (userSubscription.tier === 'premium') {
    return PREMIUM_FEATURES.premium[featureName] || PREMIUM_FEATURES.free[featureName] || false;
  }
  
  return false;
};

// Get feature upgrade prompt
export const getUpgradePrompt = (featureName) => {
  const feature = FEATURE_DESCRIPTIONS[featureName];
  if (!feature || !feature.premium) return null;
  
  return {
    title: `Upgrade to Premium`,
    message: `Unlock ${feature.title} and 20+ premium features`,
    cta: 'Upgrade Now',
    price: '$14.99/month'
  };
};

// Premium feature categories for UI
export const PREMIUM_CATEGORIES = {
  analytics: {
    title: 'Advanced Analytics',
    features: ['advancedGraphs', 'trendForecasting', 'correlationAnalysis'],
    icon: '📊'
  },
  ai: {
    title: 'AI-Powered Insights',
    features: ['emotionPrediction', 'voiceEmotionAnalysis', 'imageEmotionAnalysis'],
    icon: '🧠'
  },
  wellness: {
    title: 'Advanced Wellness',
    features: ['sleepTracking', 'stressBiomarkers', 'focusOptimization'],
    icon: '💪'
  },
  community: {
    title: 'Community & Support',
    features: ['wellnessChallenges', 'communitySupport', 'expertConsultations'],
    icon: '👥'
  }
};
