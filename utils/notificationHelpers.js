// Helper functions to create common user notifications
import { NotificationService } from '@/utils/supabaseWellness';

export const createStreakNotification = async (userId, streakDays, type = 'continue') => {
  const notifications = {
    continue: {
      title: `🔥 ${streakDays} Day Streak!`,
      message: `Amazing! You've maintained your wellness streak for ${streakDays} consecutive days. Keep it up!`,
      type: 'streak_continue'
    },
    freeze: {
      title: `❄️ Streak Freeze Activated`,
      message: `Don't worry! Your ${streakDays}-day streak is protected. Resume your wellness journey tomorrow.`,
      type: 'streak_freeze'
    },
    milestone: {
      title: `🎉 Milestone Reached!`,
      message: `Incredible! You've reached a ${streakDays}-day wellness streak. This is a major achievement!`,
      type: 'streak_milestone'
    }
  };

  const notification = notifications[type];
  if (!notification) return null;

  return await NotificationService.createUserNotification({
    userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    actionUrl: null
  });
};

export const createJournalNotification = async (userId, entryTitle) => {
  return await NotificationService.createUserNotification({
    userId,
    type: 'journal_saved',
    title: '📝 Journal Entry Saved',
    message: `Your journal entry "${entryTitle}" has been saved successfully. Keep reflecting on your journey!`,
    actionUrl: '/ai-journal-assistant'
  });
};

export const createTherapyInsightNotification = async (userId) => {
  return await NotificationService.createUserNotification({
    userId,
    type: 'therapy_insights',
    title: '🧠 Cami Therapy Insights Ready',
    message: 'Your personalized therapy session insights are now available. Discover new patterns and growth opportunities.',
    actionUrl: '/calmive-therapy'
  });
};

export const createMoodTrackingNotification = async (userId, moodLabel) => {
  return await NotificationService.createUserNotification({
    userId,
    type: 'mood_saved',
    title: '💝 Mood Tracked Successfully',
    message: `Feeling ${moodLabel} today? Your mood entry has been saved and will help track your wellness journey.`,
    actionUrl: '/analytics-insights'
  });
};

export const createWellnessGoalNotification = async (userId, goalType, progress) => {
  return await NotificationService.createUserNotification({
    userId,
    type: 'goal_progress',
    title: '🎯 Wellness Goal Update',
    message: `Great progress on your ${goalType} goal! You're ${progress}% closer to achieving your target.`,
    actionUrl: '/dashboard'
  });
};

export const createSubscriptionNotification = async (userId, planName) => {
  return await NotificationService.createUserNotification({
    userId,
    type: 'subscription_update',
    title: '✨ Premium Features Unlocked',
    message: `Welcome to ${planName}! You now have access to unlimited tracking, advanced insights, and premium features.`,
    actionUrl: '/dashboard'
  });
};

export const createMaintenanceNotification = async (userId, maintenanceDetails) => {
  return await NotificationService.createUserNotification({
    userId,
    type: 'maintenance',
    title: '🔧 Scheduled Maintenance',
    message: maintenanceDetails || 'We\'ll be performing scheduled maintenance. Your data is safe and we\'ll be back soon!',
    actionUrl: null
  });
};